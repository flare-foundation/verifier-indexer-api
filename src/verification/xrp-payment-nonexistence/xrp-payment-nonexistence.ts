import {
  IXrpGetTransactionRes,
  PaymentSummaryStatus,
  prefix0x,
  standardAddressHash,
  TransactionSuccessStatus,
  unPrefix0x,
  XrpTransaction,
} from '@flarenetwork/mcc';
import {
  XRPPaymentNonexistence_Request,
  XRPPaymentNonexistence_Response,
  XRPPaymentNonexistence_ResponseBody,
} from '../../dtos/attestation-types/XRPPaymentNonexistence.dto';
import { serializeBigInts } from '../../external-libs/serializeBigInts';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import {
  BlockResult,
  TransactionResult,
} from '../../indexed-query-manager/indexed-query-manager-types';
import { AttestationResponseStatus } from '../response-status';
import {
  VerificationResponse,
  verifyWorkflowForReferencedTransactions,
} from '../response-status';

/**
 * Auxiliary function for assembling attestation response for 'XRPPaymentNonexistence' attestation type.
 */
export function responseXRPPaymentNonexistence(
  dbTransactions: TransactionResult[],
  firstOverflowBlock: BlockResult,
  lowerBoundaryBlock: BlockResult,
  request: XRPPaymentNonexistence_Request,
) {
  for (const dbTransaction of dbTransactions) {
    let fullTxData: XrpTransaction;
    try {
      const parsedData: IXrpGetTransactionRes = JSON.parse(
        dbTransaction.getResponse(),
      ) as IXrpGetTransactionRes;
      fullTxData = new XrpTransaction(parsedData);
    } catch {
      return { status: AttestationResponseStatus.SYSTEM_FAILURE };
    }

    const paymentSummary = fullTxData.xrpPaymentSummary();

    switch (paymentSummary.status) {
      case PaymentSummaryStatus.Success:
        break;
      default:
        continue;
    }

    if (!paymentSummary.response) {
      throw new Error('critical error: should always have response');
    }

    if (!paymentSummary.response.toOne) {
      continue;
    }

    // Check destination address
    const receivingAddressHash = paymentSummary.response.receivingAddressHash;
    if (
      unPrefix0x(receivingAddressHash).toLowerCase() !==
      unPrefix0x(request.requestBody.destinationAddressHash).toLowerCase()
    ) {
      continue;
    }

    // Check amount
    if (
      paymentSummary.response.intendedReceivingAmount <
      BigInt(request.requestBody.amount.toString())
    ) {
      continue;
    }

    // Check transaction success
    if (
      paymentSummary.response.transactionStatus ===
      TransactionSuccessStatus.SENDER_FAILURE
    ) {
      continue;
    }

    // Check firstMemoDataHash if requested
    if (request.requestBody.checkFirstMemoData) {
      const memoData = paymentSummary.response.hasMemoData
        ? paymentSummary.response.memoData
        : '';
      const memoDataHash = standardAddressHash(prefix0x(memoData));
      if (
        unPrefix0x(memoDataHash).toLowerCase() !==
        unPrefix0x(request.requestBody.firstMemoDataHash).toLowerCase()
      ) {
        continue;
      }
    }

    // Check destinationTag if requested
    if (request.requestBody.checkDestinationTag) {
      const requestedDestTag = parseInt(
        BigInt(request.requestBody.destinationTag).toString(),
      );
      if (
        !paymentSummary.response.hasDestinationTag ||
        paymentSummary.response.destinationTag !== requestedDestTag
      ) {
        continue;
      }
    }

    // All conditions match — referenced transaction exists
    return {
      status: AttestationResponseStatus.REFERENCED_TRANSACTION_EXISTS,
    };
  }

  const response = new XRPPaymentNonexistence_Response({
    attestationType: request.attestationType,
    sourceId: request.sourceId,
    votingRound: '0',
    lowestUsedTimestamp: lowerBoundaryBlock.timestamp.toString(),
    requestBody: serializeBigInts(request.requestBody),
    responseBody: new XRPPaymentNonexistence_ResponseBody({
      minimalBlockTimestamp: lowerBoundaryBlock.timestamp.toString(),
      firstOverflowBlockNumber: firstOverflowBlock.blockNumber.toString(),
      firstOverflowBlockTimestamp: firstOverflowBlock.timestamp.toString(),
    }),
  });

  return {
    status: AttestationResponseStatus.VALID,
    response,
  };
}

/**
 * `XRPPaymentNonexistence` attestation type verification function.
 */
export async function verifyXRPPaymentNonexistence(
  request: XRPPaymentNonexistence_Request,
  iqm: IIndexedQueryManager,
): Promise<VerificationResponse<XRPPaymentNonexistence_Response>> {
  if (
    BigInt(request.requestBody.minimalBlockNumber) < 0 ||
    BigInt(request.requestBody.minimalBlockNumber) >= Number.MAX_SAFE_INTEGER
  ) {
    return { status: AttestationResponseStatus.INVALID_SEARCH_RANGE };
  }

  if (
    BigInt(request.requestBody.deadlineBlockNumber) < 0 ||
    BigInt(request.requestBody.deadlineBlockNumber) >= Number.MAX_SAFE_INTEGER
  ) {
    return { status: AttestationResponseStatus.INVALID_SEARCH_RANGE };
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
    paymentReference: undefined,
  });

  const status = verifyWorkflowForReferencedTransactions(
    referencedTransactionsResponse,
  );
  if (status !== AttestationResponseStatus.NEEDS_MORE_CHECKS) {
    return { status };
  }

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
      status: AttestationResponseStatus.INVALID_SEARCH_RANGE,
    };
  }

  return responseXRPPaymentNonexistence(
    dbTransactions,
    firstOverflowBlock,
    lowerBoundaryBlock,
    request,
  );
}
