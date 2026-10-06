import {
  BalanceDecreasingSummaryResponse,
  BalanceDecreasingSummaryStatus,
  TransactionBase,
  XrpTransaction,
  ZERO_BYTES_32,
  unPrefix0x,
} from '@flarenetwork/mcc';
import {
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
  BalanceDecreasingTransaction_ResponseBody,
} from '../../dtos/attestation-types/BalanceDecreasingTransaction.dto';
import { serializeBigInts } from '../../external-libs/serializeBigInts';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import { TransactionResult } from '../../indexed-query-manager/indexed-query-manager-types';
import {
  VerificationResponse,
  verifyWorkflowForTransaction,
} from '../response-status';
import { AttestationResponseStatus } from './../response-status';

//////////////////////////////////////////////////
// Verification functions
/////////////////////////////////////////////////

/**
 * Temporary: from the activation chain tip only native XRP payments keep the memo.
 * Remove once all networks are past activation.
 */
export function xrpPaymentReference(
  transaction: XrpTransaction,
  chainTipTimestamp: number,
  activationTimestamp: number,
): string {
  const keepsMemo =
    chainTipTimestamp >= activationTimestamp
      ? transaction.isNativePayment
      : transaction.type === 'Payment';
  return keepsMemo ? transaction.stdPaymentReference : ZERO_BYTES_32;
}

/**
 * Auxiliary function for assembling attestation response for 'BalanceDecreasingTransaction' attestation type.
 * @param dbTransaction
 * @param TransactionClass
 * @param request
 * @param iqm IndexedQuery object for the relevant blockchain indexer
 * @param xrpBalanceDecreasingTransactionActivation XRP only, see `xrpPaymentReference`
 * @returns
 */
export async function responseBalanceDecreasingTransaction<
  T extends TransactionBase<unknown>,
>(
  dbTransaction: TransactionResult,
  TransactionClass: new (...args: unknown[]) => T,
  request: BalanceDecreasingTransaction_Request,
  iqm: IIndexedQueryManager,
  xrpBalanceDecreasingTransactionActivation?: number,
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
    return { status: AttestationResponseStatus.SYSTEM_FAILURE };
  }

  const fullTxData = new TransactionClass(parsedData);

  const balanceDecreasingSummary: BalanceDecreasingSummaryResponse =
    fullTxData.balanceDecreasingSummary(
      request.requestBody.sourceAddressIndicator,
    );

  const status = balanceDecreasingSummary.status;
  if (status === BalanceDecreasingSummaryStatus.Coinbase) {
    return { status: AttestationResponseStatus.COINBASE_TRANSACTION };
  } else if (status === BalanceDecreasingSummaryStatus.NoSourceAddress) {
    return { status: AttestationResponseStatus.NO_SOURCE_ADDRESS };
  } else if (status !== BalanceDecreasingSummaryStatus.Success) {
    return { status: AttestationResponseStatus.INVALID };
  }

  if (!balanceDecreasingSummary.response) {
    throw new Error('critical error: should always have response');
  }

  let paymentReference = balanceDecreasingSummary.response.paymentReference;
  if (
    fullTxData instanceof XrpTransaction &&
    xrpBalanceDecreasingTransactionActivation !== undefined
  ) {
    const chainTip = await iqm.getLatestBlockTimestamp();
    if (!chainTip) {
      throw new Error('XRP chain tip is not available in the indexer database');
    }
    paymentReference = xrpPaymentReference(
      fullTxData,
      chainTip.timestamp,
      xrpBalanceDecreasingTransactionActivation,
    );
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
      standardPaymentReference: paymentReference.toLowerCase(),
    }),
  });

  return {
    status: AttestationResponseStatus.VALID,
    response,
  };
}

/**
 * `BalanceDecreasingTransaction` attestation type verification function performing synchronized indexer queries
 * @param TransactionClass
 * @param request attestation request
 * @param requestOptions request options
 * @param iqm IndexedQuery object for the relevant blockchain indexer
 * @param xrpBalanceDecreasingTransactionActivation XRP only, see `xrpPaymentReference`
 * @returns Verification response, status and attestation response
 * @category Verifiers
 */
export async function verifyBalanceDecreasingTransaction<
  T extends TransactionBase<unknown>,
>(
  TransactionClass: new (...args: unknown[]) => T,
  request: BalanceDecreasingTransaction_Request,
  iqm: IIndexedQueryManager,
  xrpBalanceDecreasingTransactionActivation?: number,
): Promise<VerificationResponse<BalanceDecreasingTransaction_Response>> {
  // Check for transaction
  const confirmedTransactionResult = await iqm.getConfirmedTransaction({
    txId: unPrefix0x(request.requestBody.transactionId),
  });

  const status = verifyWorkflowForTransaction(confirmedTransactionResult);
  if (status !== AttestationResponseStatus.NEEDS_MORE_CHECKS) {
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
    iqm,
    xrpBalanceDecreasingTransactionActivation,
  );
}
