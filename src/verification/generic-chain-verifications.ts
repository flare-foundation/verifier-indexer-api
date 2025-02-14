import {
  BalanceDecreasingSummaryResponse,
  BalanceDecreasingSummaryStatus,
  PaymentNonexistenceSummaryStatus,
  PaymentSummaryResponse,
  PaymentSummaryStatus,
  standardAddressHash,
  TransactionBase,
  TransactionSuccessStatus,
  unPrefix0x,
  ZERO_BYTES_32,
} from '@flarenetwork/mcc';
import {
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
  BalanceDecreasingTransaction_ResponseBody,
} from '../dtos/attestation-types/BalanceDecreasingTransaction.dto';
import {
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response,
  ConfirmedBlockHeightExists_ResponseBody,
} from '../dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import {
  Payment_Request,
  Payment_Response,
  Payment_ResponseBody,
} from '../dtos/attestation-types/Payment.dto';
import {
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
  ReferencedPaymentNonexistence_ResponseBody,
} from '../dtos/attestation-types/ReferencedPaymentNonexistence.dto';
import { serializeBigInts } from '../external-libs/utils';
import { IIndexedQueryManager } from '../indexed-query-manager/IIndexedQueryManager';
import {
  BlockResult,
  TransactionResult,
} from '../indexed-query-manager/indexed-query-manager-types';
import { VerificationStatus } from './attestation-types/attestation-types';
import {
  VerificationResponse,
  verifyWorkflowForBlock,
  verifyWorkflowForReferencedTransactions,
  verifyWorkflowForTransaction,
} from './verification-utils';

//////////////////////////////////////////////////
// Verification functions
/////////////////////////////////////////////////

/**
 * Auxillary function for assembling attestation response for 'Payment' attestation type.
 * @param dbTransaction
 * @param TransactionClass
 * @param request
 * @param client
 * @returns
 */
export function responsePayment<T extends TransactionBase<unknown>>(
  dbTransaction: TransactionResult,
  TransactionClass: new (...args: unknown[]) => T,
  request: Payment_Request,
) {
  let parsedData: unknown;
  try {
    parsedData = JSON.parse(dbTransaction.getResponse());
  } catch (error) {
    console.error(
      error,
      `responsePayment '${
        dbTransaction.transactionId
      }' JSON parse '${dbTransaction.getResponse()}'`,
    );
    return { status: VerificationStatus.SYSTEM_FAILURE };
  }
  const fullTxData = new TransactionClass(parsedData);
  if (
    BigInt(request.requestBody.inUtxo) < 0 ||
    BigInt(request.requestBody.inUtxo) >= Number.MAX_SAFE_INTEGER
  ) {
    return { status: VerificationStatus.NOT_CONFIRMED };
  }
  if (
    BigInt(request.requestBody.utxo) < 0 ||
    BigInt(request.requestBody.utxo) >= Number.MAX_SAFE_INTEGER
  ) {
    return { status: VerificationStatus.NOT_CONFIRMED };
  }

  // We assume that a transaction cannot have more than Number.MAX_SAFE_INTEGER utxo inputs or outputs.
  const inUtxoNumber = parseInt(BigInt(request.requestBody.inUtxo).toString());
  const utxoNumber = parseInt(BigInt(request.requestBody.utxo).toString());

  let paymentSummary: PaymentSummaryResponse;
  try {
    paymentSummary = fullTxData.paymentSummary({
      inUtxo: inUtxoNumber,
      outUtxo: utxoNumber,
    });
  } catch {
    return { status: VerificationStatus.NOT_CONFIRMED };
  }

  if (paymentSummary.status !== PaymentSummaryStatus.Success) {
    return { status: VerificationStatus.NOT_CONFIRMED };
  }

  if (!paymentSummary.response) {
    throw new Error('critical error: should always have response');
  }
  const response = new Payment_Response({
    attestationType: request.attestationType,
    sourceId: request.sourceId,
    votingRound: '0',
    lowestUsedTimestamp: fullTxData.unixTimestamp.toString(),
    requestBody: serializeBigInts(request.requestBody),
    responseBody: new Payment_ResponseBody({
      blockNumber: dbTransaction.blockNumber.toString(),
      blockTimestamp: dbTransaction.timestamp.toString(),
      sourceAddressHash:
        paymentSummary.response.sourceAddressHash.toLowerCase(),
      sourceAddressesRoot:
        paymentSummary.response.sourceAddressesRoot.toLowerCase(),
      receivingAddressHash:
        paymentSummary.response.receivingAddressHash.toLowerCase(),
      intendedReceivingAddressHash:
        paymentSummary.response.intendedReceivingAddressHash.toLowerCase(),
      standardPaymentReference:
        paymentSummary.response.paymentReference.toLowerCase(),
      spentAmount: paymentSummary.response.spentAmount.toString(),
      intendedSpentAmount:
        paymentSummary.response.intendedSourceAmount.toString(),
      receivedAmount: paymentSummary.response.receivedAmount.toString(),
      intendedReceivedAmount:
        paymentSummary.response.intendedReceivingAmount.toString(),
      oneToOne: paymentSummary.response.oneToOne,
      status: fullTxData.successStatus.toString(),
    }),
  });

  return {
    status: VerificationStatus.OK,
    response,
  };
}

/**
 * `Payment` attestation type verification function performing synchronized indexer queries
 * @param TransactionClass
 * @param request attestation request
 * @param iqm IndexedQuery object for the relevant blockchain indexer
 * @param client MCC client for the relevant blockchain
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyPayment<T extends TransactionBase<unknown>>(
  TransactionClass: new (...args: unknown[]) => T,
  request: Payment_Request,
  iqm: IIndexedQueryManager,
): Promise<VerificationResponse<Payment_Response>> {
  // Check for transaction
  const confirmedTransactionResult = await iqm.getConfirmedTransaction({
    txId: unPrefix0x(request.requestBody.transactionId),
  });
  const status = verifyWorkflowForTransaction(confirmedTransactionResult);
  if (status !== VerificationStatus.NEEDS_MORE_CHECKS) {
    return { status };
  }

  const dbTransaction = confirmedTransactionResult.transaction;
  const responsePaymentR = responsePayment(
    dbTransaction,
    TransactionClass,
    request,
  );
  return responsePaymentR;
}

/**
 * Auxillary function for assembling attestation response for 'BalanceDecreasingTransaction' attestation type.
 * @param dbTransaction
 * @param TransactionClass
 * @param sourceAddressIndicator
 * @param client
 * @returns
 */
export function responseBalanceDecreasingTransaction<
  T extends TransactionBase<unknown>,
>(
  dbTransaction: TransactionResult,
  TransactionClass: new (...args: unknown[]) => T,
  request: BalanceDecreasingTransaction_Request,
) {
  let parsedData: unknown;
  try {
    parsedData = JSON.parse(dbTransaction.getResponse());
  } catch (error) {
    // TODO: add logger
    console.error(
      error,
      `responseBalanceDecreasingTransaction '${
        dbTransaction.transactionId
      }' JSON parse '${dbTransaction.getResponse()}'`,
    );
    return { status: VerificationStatus.SYSTEM_FAILURE };
  }

  const fullTxData = new TransactionClass(parsedData);

  const balanceDecreasingSummary: BalanceDecreasingSummaryResponse =
    fullTxData.balanceDecreasingSummary(
      request.requestBody.sourceAddressIndicator,
    );

  if (
    balanceDecreasingSummary.status !== BalanceDecreasingSummaryStatus.Success
  ) {
    return { status: VerificationStatus.NOT_CONFIRMED };
  }

  if (!balanceDecreasingSummary.response) {
    throw new Error('critical error: should always have response');
  }

  const response = new BalanceDecreasingTransaction_Response({
    attestationType: request.attestationType,
    sourceId: request.sourceId,
    votingRound: '0',
    lowestUsedTimestamp: fullTxData.unixTimestamp.toString(),
    requestBody: serializeBigInts(request.requestBody),
    responseBody: new BalanceDecreasingTransaction_ResponseBody({
      blockNumber: dbTransaction.blockNumber.toString(),
      blockTimestamp: dbTransaction.timestamp.toString(),
      sourceAddressHash:
        balanceDecreasingSummary.response.sourceAddressHash.toLowerCase(),
      spentAmount: balanceDecreasingSummary.response.spentAmount.toString(),
      standardPaymentReference:
        balanceDecreasingSummary.response.paymentReference.toLowerCase(),
    }),
  });

  return {
    status: VerificationStatus.OK,
    response,
  };
}

/**
 * `BalanceDecreasingTransaction` attestation type verification function performing synchronized indexer queries
 * @param TransactionClass
 * @param request attestation request
 * @param requestOptions request options
 * @param iqm IndexedQuery object for the relevant blockchain indexer
 * @param client MCC client for the relevant blockchain
 * @returns Verification response, status and attestation response
 * @category Verifiers
 */
export async function verifyBalanceDecreasingTransaction<
  T extends TransactionBase<unknown>,
>(
  TransactionClass: new (...args: unknown[]) => T,
  request: BalanceDecreasingTransaction_Request,
  iqm: IIndexedQueryManager,
): Promise<VerificationResponse<BalanceDecreasingTransaction_Response>> {
  // Check for transaction
  const confirmedTransactionResult = await iqm.getConfirmedTransaction({
    txId: unPrefix0x(request.requestBody.transactionId),
  });

  const status = verifyWorkflowForTransaction(confirmedTransactionResult);
  if (status !== VerificationStatus.NEEDS_MORE_CHECKS) {
    return { status };
  }

  const dbTransaction = confirmedTransactionResult.transaction;
  if (!dbTransaction) {
    throw new Error('critical error: should always have response');
  }
  return responseBalanceDecreasingTransaction(
    dbTransaction,
    TransactionClass,
    request,
  );
}

/**
 * Auxillary function for assembling attestation response for 'ConfirmedBlockHeightExists' attestation type.
 * @param dbBlock
 * @param lowerQueryWindowBlock
 * @param numberOfConfirmations
 * @param request
 * @returns
 */
export function responseConfirmedBlockHeightExists(
  dbBlock: BlockResult,
  lowerQueryWindowBlock: BlockResult,
  numberOfConfirmations: number,
  request: ConfirmedBlockHeightExists_Request,
) {
  const response = new ConfirmedBlockHeightExists_Response({
    attestationType: request.attestationType,
    sourceId: request.sourceId,
    votingRound: '0',
    lowestUsedTimestamp: dbBlock.timestamp.toString(),
    requestBody: serializeBigInts(request.requestBody),
    responseBody: new ConfirmedBlockHeightExists_ResponseBody({
      blockTimestamp: dbBlock.timestamp.toString(),
      numberOfConfirmations: numberOfConfirmations.toString(),
      lowestQueryWindowBlockNumber:
        lowerQueryWindowBlock.blockNumber.toString(),
      lowestQueryWindowBlockTimestamp:
        lowerQueryWindowBlock.timestamp.toString(),
    }),
  });

  return {
    status: VerificationStatus.OK,
    response,
  };
}

/**
 * `ConfirmedBlockHeightExists` attestation type verification function performing synchronized indexer queries
 * @param request attestation request
 * @param iqm IndexedQuery object for the relevant blockchain indexer
 * @returns Verification response, status and attestation response
 */
export async function verifyConfirmedBlockHeightExists(
  request: ConfirmedBlockHeightExists_Request,
  iqm: IIndexedQueryManager,
): Promise<VerificationResponse<ConfirmedBlockHeightExists_Response>> {
  const confirmedBlockQueryResult = await iqm.getConfirmedBlock({
    blockNumber: parseInt(BigInt(request.requestBody.blockNumber).toString()),
  });

  const status = verifyWorkflowForBlock(confirmedBlockQueryResult);
  if (status !== VerificationStatus.NEEDS_MORE_CHECKS) {
    return { status };
  }

  const dbBlock = confirmedBlockQueryResult.block;
  if (!dbBlock) {
    throw new Error('critical error: should always have response');
  }
  const lowerQueryWindowBlock =
    await iqm.getLastConfirmedBlockStrictlyBeforeTime(
      dbBlock.timestamp -
        parseInt(BigInt(request.requestBody.queryWindow).toString()),
    );

  if (!lowerQueryWindowBlock) {
    return {
      status: VerificationStatus.DATA_AVAILABILITY_ISSUE,
    };
  }
  return responseConfirmedBlockHeightExists(
    dbBlock,
    lowerQueryWindowBlock,
    iqm.numberOfConfirmations(),
    request,
  );
}

/**
 * Auxillary function for assembling attestation response for 'ConfirmedBlockHeightExists' attestation type.
 * @param dbTransactions
 * @param TransactionClass
 * @param firstOverflowBlock
 * @param lowerBoundaryBlock
 * @param deadlineBlockNumber
 * @param deadlineTimestamp
 * @param destinationAddressHash
 * @param paymentReference
 * @param amount
 * @returns
 */
export function responseReferencedPaymentNonExistence<
  T extends TransactionBase<unknown>,
>(
  dbTransactions: TransactionResult[],
  TransactionClass: new (...args: unknown[]) => T,
  firstOverflowBlock: BlockResult,
  lowerBoundaryBlock: BlockResult,
  request: ReferencedPaymentNonexistence_Request,
) {
  // Check transactions for a matching
  for (const dbTransaction of dbTransactions) {
    let fullTxData: T;
    try {
      const parsedData: unknown = JSON.parse(dbTransaction.getResponse());
      fullTxData = new TransactionClass(parsedData);
    } catch {
      return { status: VerificationStatus.SYSTEM_FAILURE };
    }

    // In account based case this loop goes through only once.
    for (
      let outUtxo = 0;
      outUtxo < fullTxData.intendedReceivedAmounts.length;
      outUtxo++
    ) {
      const address = fullTxData.intendedReceivedAmounts[outUtxo].address;
      if (!address) {
        // no-address utxo, we skip it
        continue;
      }
      const destinationAddressHashTmp = standardAddressHash(address);
      if (
        unPrefix0x(destinationAddressHashTmp) ===
        unPrefix0x(request.requestBody.destinationAddressHash)
      ) {
        const paymentSummary = fullTxData.paymentNonexistenceSummary(outUtxo);

        if (
          paymentSummary.status !== PaymentNonexistenceSummaryStatus.Success
        ) {
          // Payment summary for each output matching the destination address is equal, so the destination address has been processed.
          break;
        }

        if (!paymentSummary.response) {
          throw new Error('critical error: should always have response');
        }
        if (
          paymentSummary.response.intendedReceivingAmount >=
          BigInt(request.requestBody.amount.toString())
        ) {
          if (
            paymentSummary.response.transactionStatus !==
            TransactionSuccessStatus.SENDER_FAILURE
          ) {
            // it must be SUCCESS or RECEIVER_FAULT, so the sender sent it correctly
            return { status: VerificationStatus.REFERENCED_TRANSACTION_EXISTS };
          }
        }
        // Payment summary for each output matching the destination address is equal, so the destination address has been processed.
        break;
      }
    }
  }

  const response = new ReferencedPaymentNonexistence_Response({
    attestationType: request.attestationType,
    sourceId: request.sourceId,
    votingRound: '0',
    lowestUsedTimestamp: lowerBoundaryBlock.timestamp.toString(),
    requestBody: serializeBigInts(request.requestBody),
    responseBody: new ReferencedPaymentNonexistence_ResponseBody({
      minimalBlockTimestamp: lowerBoundaryBlock.blockNumber.toString(),
      firstOverflowBlockNumber: firstOverflowBlock.blockNumber.toString(),
      firstOverflowBlockTimestamp: firstOverflowBlock.timestamp.toString(),
    }),
  });

  return {
    status: VerificationStatus.OK,
    response,
  };
}

/**
 * `ReferencedPaymentNonExistence` attestation type verification function performing synchronized indexer queries
 * @param TransactionClass
 * @param request attestation request
 * @param requestOptions request options
 * @param iqm IndexedQuery object for the relevant blockchain indexer
 * @returns Verification response, status and attestation response
 */
export async function verifyReferencedPaymentNonExistence<
  T extends TransactionBase<unknown>,
>(
  TransactionClass: new (...args: unknown[]) => T,
  request: ReferencedPaymentNonexistence_Request,
  iqm: IIndexedQueryManager,
): Promise<VerificationResponse<ReferencedPaymentNonexistence_Response>> {
  // DANGER: How to handle this if there are a lot of transactions with same payment reference in the interval?

  if (
    unPrefix0x(request.requestBody.standardPaymentReference).toLowerCase() ===
    unPrefix0x(ZERO_BYTES_32).toLowerCase()
  ) {
    return { status: VerificationStatus.ZERO_PAYMENT_REFERENCE_UNSUPPORTED };
  }

  if (
    !/^[0-9A-Fa-f]{64}$/.test(
      unPrefix0x(request.requestBody.standardPaymentReference.toLowerCase()),
    )
  ) {
    return { status: VerificationStatus.NOT_STANDARD_PAYMENT_REFERENCE };
  }

  if (
    !/^[0-9A-Fa-f]{64}$/.test(
      unPrefix0x(request.requestBody.sourceAddressesRoot.toLowerCase()),
    )
  ) {
    return { status: VerificationStatus.NOT_STANDARD_SOURCE_ADDRESS_ROOT };
  }

  if (
    BigInt(request.requestBody.minimalBlockNumber) < 0 ||
    BigInt(request.requestBody.minimalBlockNumber) >= Number.MAX_SAFE_INTEGER
  ) {
    return { status: VerificationStatus.NOT_CONFIRMED };
  }

  if (
    BigInt(request.requestBody.deadlineBlockNumber) < 0 ||
    BigInt(request.requestBody.deadlineBlockNumber) >= Number.MAX_SAFE_INTEGER
  ) {
    return { status: VerificationStatus.NOT_CONFIRMED };
  }

  const minimalBlockNumber = parseInt(
    BigInt(request.requestBody.minimalBlockNumber).toString(),
  );
  const deadlineBlockNumber = parseInt(
    BigInt(request.requestBody.deadlineBlockNumber).toString(),
  );

  const referencedTransactionsResponse = await iqm.getReferencedTransactions({
    minimalBlockNumber,
    deadlineBlockNumber,
    deadlineBlockTimestamp: parseInt(
      BigInt(request.requestBody.deadlineTimestamp).toString(),
    ),
    paymentReference: unPrefix0x(request.requestBody.standardPaymentReference),
    sourceAddressRoot: request.requestBody.checkSourceAddresses
      ? unPrefix0x(request.requestBody.sourceAddressesRoot)
      : undefined,
  });

  const status = verifyWorkflowForReferencedTransactions(
    referencedTransactionsResponse,
  );
  if (status !== VerificationStatus.NEEDS_MORE_CHECKS) {
    return { status };
  }

  // From here on these exist, dbTransactions can be an empty list.
  const dbTransactions = referencedTransactionsResponse.transactions;
  const firstOverflowBlock = referencedTransactionsResponse.firstOverflowBlock;
  const lowerBoundaryBlock = referencedTransactionsResponse.minimalBlock;

  if (!dbTransactions) {
    throw new Error('critical error: should always have response');
  }
  if (!firstOverflowBlock) {
    throw new Error('critical error: should always have response');
  }
  if (!lowerBoundaryBlock) {
    throw new Error('critical error: should always have response');
  }
  if (minimalBlockNumber >= firstOverflowBlock.blockNumber) {
    return {
      status: VerificationStatus.NOT_CONFIRMED,
    };
  }

  const nonexistanceResponse = responseReferencedPaymentNonExistence(
    dbTransactions,
    TransactionClass,
    firstOverflowBlock,
    lowerBoundaryBlock,
    request,
  );

  return nonexistanceResponse;
}
