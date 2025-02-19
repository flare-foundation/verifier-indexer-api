import {
  PaymentSummaryResponse,
  PaymentSummaryStatus,
  TransactionBase,
  unPrefix0x,
} from '@flarenetwork/mcc';
import {
  Payment_Request,
  Payment_Response,
  Payment_ResponseBody,
} from '../../dtos/attestation-types/Payment.dto';
import { serializeBigInts } from '../../external-libs/utils';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import { TransactionResult } from '../../indexed-query-manager/indexed-query-manager-types';
import { VerificationStatus } from './../attestation-types';
import {
  VerificationResponse,
  verifyWorkflowForTransaction,
} from './../verification-utils';

//////////////////////////////////////////////////
// Verification functions
/////////////////////////////////////////////////

/**
 * Auxiliary function for assembling attestation response for 'Payment' attestation type.
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

  // if there is more than one output to the receiving address, the payment is not valid.
  if (!paymentSummary.response.toOne) {
    return { status: VerificationStatus.NOT_CONFIRMED };
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
