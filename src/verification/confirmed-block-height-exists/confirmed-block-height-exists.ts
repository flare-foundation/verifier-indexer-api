import {
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response,
  ConfirmedBlockHeightExists_ResponseBody,
} from '../../dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import { serializeBigInts } from '../../external-libs/utils';
import { IIndexedQueryManager } from '../../indexed-query-manager/IIndexedQueryManager';
import { BlockResult } from '../../indexed-query-manager/indexed-query-manager-types';
import {
  VerificationResponse,
  verifyWorkflowForBlock,
} from '../response-status';
import { AttestationResponseStatus } from './../response-status';

/**
 * Auxiliary function for assembling attestation response for 'ConfirmedBlockHeightExists' attestation type.
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
    status: AttestationResponseStatus.VALID,
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
  if (status !== AttestationResponseStatus.NEEDS_MORE_CHECKS) {
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
      status: AttestationResponseStatus.BLOCK_AVAILABILITY_ISSUE,
    };
  }
  return responseConfirmedBlockHeightExists(
    dbBlock,
    lowerQueryWindowBlock,
    iqm.numberOfConfirmations(),
    request,
  );
}
