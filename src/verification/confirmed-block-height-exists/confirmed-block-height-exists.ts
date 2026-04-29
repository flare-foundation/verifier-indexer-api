import { encodeAttestationName } from '@flarenetwork/js-flare-common';
import {
  ConfirmedBlockHeightExists_Request,
  ConfirmedBlockHeightExists_Response,
  ConfirmedBlockHeightExists_ResponseBody,
} from '../../dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import { serializeBigInts } from '../../external-libs/serializeBigInts';
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
  // Hard fork: blocks before this timestamp use dbBlock.timestamp as LUT,
  // blocks at or after use lowerQueryWindowBlock.timestamp.
  // Delete me after 1778576400 Tuesday, 12 May 2026 at 11:00:00 CEST
  const CBHE_LUT_DOGE_BTC_FORK_TIMESTAMP = 1778576400; // Tuesday, 12 May 2026 at 11:00:00 CEST
  let lut: string;
  const XRP_POST_FORK_SOURCES = ['XRP', 'testXRP'].map(encodeAttestationName);
  const DOGE_BTC_FORK_SOURCES = ['DOGE', 'testDOGE', 'BTC', 'testBTC'].map(
    encodeAttestationName,
  );
  if (XRP_POST_FORK_SOURCES.includes(request.sourceId)) {
    // WE are post XRP lut fork time 1777366800 Tuesday, 28 April 2026 at 11:00:00 CEST
    lut = lowerQueryWindowBlock.timestamp.toString();
  } else if (DOGE_BTC_FORK_SOURCES.includes(request.sourceId)) {
    // We are pre DOGE/BTC lut fork time 1778576400 Tuesday, 12 May 2026 at 11:00:00 CEST
    // Delete me after 1778576400 Tuesday, 12 May 2026 at 11:00:00 CEST
    lut =
      dbBlock.timestamp < CBHE_LUT_DOGE_BTC_FORK_TIMESTAMP
        ? dbBlock.timestamp.toString()
        : lowerQueryWindowBlock.timestamp.toString();
  } else {
    lut = lowerQueryWindowBlock.timestamp.toString();
  }

  // Post for time:
  // const lut = lowerQueryWindowBlock.timestamp.toString();

  const response = new ConfirmedBlockHeightExists_Response({
    attestationType: request.attestationType,
    sourceId: request.sourceId,
    votingRound: '0',
    lowestUsedTimestamp: lut,
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
