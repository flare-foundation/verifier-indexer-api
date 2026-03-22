import {
  IXrpGetTransactionRes,
  PaymentSummaryStatus,
  XrpPaymentSummaryResponse,
  XrpTransaction,
  unPrefix0x,
} from '@flarenetwork/mcc';
import {
  XRPPayment_Request,
  XRPPayment_Response,
  XRPPayment_ResponseBody,
} from '../../dtos/attestation-types/XRPPayment.dto';
import { serializeBigInts } from '../../external-libs/serializeBigInts';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import { TransactionResult } from '../../indexed-query-manager/indexed-query-manager-types';
import {
  VerificationResponse,
  verifyWorkflowForTransaction,
} from '../response-status';
import { AttestationResponseStatus } from './../response-status';

/**
 * Auxiliary function for assembling attestation response for 'XRPPayment' attestation type.
 */
export function responseXRPPayment(
  dbTransaction: TransactionResult,
  request: XRPPayment_Request,
) {
  let parsedData: IXrpGetTransactionRes;
  try {
    parsedData = JSON.parse(
      dbTransaction.getResponse(),
    ) as IXrpGetTransactionRes;
  } catch (error) {
    console.error(
      error,
      `responseXRPPayment '${
        dbTransaction.transactionId
      }' JSON parse '${dbTransaction.getResponse()}'`,
    );
    return { status: AttestationResponseStatus.SYSTEM_FAILURE };
  }
  const xrpTransactionObject = new XrpTransaction(parsedData);

  let paymentSummary: XrpPaymentSummaryResponse;
  try {
    paymentSummary = xrpTransactionObject.xrpPaymentSummary();
  } catch {
    return { status: AttestationResponseStatus.INVALID };
  }

  switch (paymentSummary.status) {
    case PaymentSummaryStatus.Success:
      break;
    case PaymentSummaryStatus.Coinbase:
      return { status: AttestationResponseStatus.COINBASE_TRANSACTION };
    case PaymentSummaryStatus.NotNativePayment:
      return { status: AttestationResponseStatus.NO_NATIVE_PAYMENT };
    case PaymentSummaryStatus.NoSpentAmountAddress:
      return { status: AttestationResponseStatus.NO_SOURCE_ADDRESS };
    case PaymentSummaryStatus.NoReceiveAmountAddress:
      return { status: AttestationResponseStatus.NO_RECEIVING_ADDRESS };
    case PaymentSummaryStatus.UnexpectedNumberOfParticipants:
      return {
        status: AttestationResponseStatus.UNEXPECTED_NUMBER_OF_PARTICIPANTS,
      };
    case PaymentSummaryStatus.NoIntendedSpentAmountAddress:
      return { status: AttestationResponseStatus.NO_INTENDED_SOURCE_ADDRESS };
    case PaymentSummaryStatus.NoIntendedReceiveAmountAddress:
      return {
        status: AttestationResponseStatus.NO_INTENDED_RECEIVING_ADDRESS,
      };
    default:
      return { status: AttestationResponseStatus.INVALID };
  }

  if (!paymentSummary.response) {
    throw new Error('critical error: should always have response');
  }

  if (!paymentSummary.response.toOne) {
    return { status: AttestationResponseStatus.MORE_THAN_ONE_OUTPUT };
  }

  const response = new XRPPayment_Response({
    attestationType: request.attestationType,
    sourceId: request.sourceId,
    votingRound: '0',
    lowestUsedTimestamp: xrpTransactionObject.unixTimestamp.toString(),
    requestBody: serializeBigInts(request.requestBody),
    responseBody: new XRPPayment_ResponseBody({
      blockNumber: dbTransaction.blockNumber.toString(),
      blockTimestamp: dbTransaction.timestamp.toString(),
      sourceAddress: paymentSummary.response.sourceAddress,
      sourceAddressHash:
        paymentSummary.response.sourceAddressHash.toLowerCase(),
      receivingAddressHash:
        paymentSummary.response.receivingAddressHash.toLowerCase(),
      intendedReceivingAddressHash:
        paymentSummary.response.intendedReceivingAddressHash.toLowerCase(),
      spentAmount: paymentSummary.response.spentAmount.toString(),
      intendedSpentAmount:
        paymentSummary.response.intendedSourceAmount.toString(),
      receivedAmount: paymentSummary.response.receivedAmount.toString(),
      intendedReceivedAmount:
        paymentSummary.response.intendedReceivingAmount.toString(),
      hasMemoData: paymentSummary.response.hasMemoData,
      firstMemoData: paymentSummary.response.hasMemoData
        ? '0x' + paymentSummary.response.memoData
        : '',
      hasDestinationTag: paymentSummary.response.hasDestinationTag,
      destinationTag: paymentSummary.response.hasDestinationTag
        ? paymentSummary.response.destinationTag.toString()
        : '0',
      status: xrpTransactionObject.successStatus.toString(),
    }),
  });

  return {
    status: AttestationResponseStatus.VALID,
    response,
  };
}

/**
 * `XRPPayment` attestation type verification function.
 */
export async function verifyXRPPayment(
  request: XRPPayment_Request,
  iqm: IIndexedQueryManager,
): Promise<VerificationResponse<XRPPayment_Response>> {
  const confirmedTransactionResult = await iqm.getConfirmedTransaction({
    txId: unPrefix0x(request.requestBody.transactionId),
  });
  const status = verifyWorkflowForTransaction(confirmedTransactionResult);
  if (status !== AttestationResponseStatus.NEEDS_MORE_CHECKS) {
    return { status };
  }

  const dbTransaction = confirmedTransactionResult.transaction;
  return responseXRPPayment(dbTransaction, request);
}
