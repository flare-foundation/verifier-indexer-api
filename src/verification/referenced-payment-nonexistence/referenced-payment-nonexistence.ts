import {
  PaymentNonexistenceSummaryStatus,
  standardAddressHash,
  TransactionBase,
  TransactionSuccessStatus,
  unPrefix0x,
  ZERO_BYTES_32,
} from '@flarenetwork/mcc';
import {
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
  ReferencedPaymentNonexistence_ResponseBody,
} from '../../dtos/attestation-types/ReferencedPaymentNonexistence.dto';
import { serializeBigInts } from '../../external-libs/utils';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import {
  BlockResult,
  TransactionResult,
} from '../../indexed-query-manager/indexed-query-manager-types';
import { VerificationStatus } from '../attestation-types';
import {
  VerificationResponse,
  verifyWorkflowForReferencedTransactions,
} from '../verification-utils';

/**
 * Auxiliary function for assembling attestation response for 'ReferencedPaymentNonExistence' attestation type.
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

        if (!paymentSummary.response.toOne) {
          // There is more than one output to the specified address, thus the payment is not valid.
          break;
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

  const nonexistenceResponse = responseReferencedPaymentNonExistence(
    dbTransactions,
    TransactionClass,
    firstOverflowBlock,
    lowerBoundaryBlock,
    request,
  );

  return nonexistenceResponse;
}
