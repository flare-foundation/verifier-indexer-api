import {
  BalanceDecreasingSummaryResponse,
  BalanceDecreasingSummaryStatus,
  TransactionBase,
  unPrefix0x,
} from '@flarenetwork/mcc';
import {
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
  BalanceDecreasingTransaction_ResponseBody,
} from '../../dtos/attestation-types/BalanceDecreasingTransaction.dto';
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
 * Auxiliary function for assembling attestation response for 'BalanceDecreasingTransaction' attestation type.
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
