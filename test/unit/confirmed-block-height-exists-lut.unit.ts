import { expect } from 'chai';
import { responseConfirmedBlockHeightExists } from '../../src/verification/confirmed-block-height-exists/confirmed-block-height-exists';
import { BlockResult } from '../../src/indexed-query-manager/indexed-query-manager-types';
import { ConfirmedBlockHeightExists_Request } from '../../src/dtos/attestation-types/ConfirmedBlockHeightExists.dto';
import { AttestationResponseStatus } from '../../src/verification/response-status';

const CBHE_LUT_FORK_TIMESTAMP = 1777366800;

function makeRequest(): ConfirmedBlockHeightExists_Request {
  return new ConfirmedBlockHeightExists_Request({
    attestationType:
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
    sourceId:
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    requestBody: { blockNumber: '100', queryWindow: '1' },
  });
}

function makeBlock(overrides: Partial<BlockResult>): BlockResult {
  return {
    blockNumber: 100,
    timestamp: 0,
    transactions: 1,
    confirmed: true,
    blockHash: '0x' + 'ab'.repeat(32),
    ...overrides,
  };
}

describe('responseConfirmedBlockHeightExists LUT hard fork', () => {
  const numberOfConfirmations = 6;

  it('uses dbBlock.timestamp as LUT before the fork', () => {
    const dbBlock = makeBlock({ timestamp: CBHE_LUT_FORK_TIMESTAMP - 100 });
    const lowerQueryWindowBlock = makeBlock({
      blockNumber: 90,
      timestamp: CBHE_LUT_FORK_TIMESTAMP - 200,
    });

    const result = responseConfirmedBlockHeightExists(
      dbBlock,
      lowerQueryWindowBlock,
      numberOfConfirmations,
      makeRequest(),
    );

    expect(result.status).to.equal(AttestationResponseStatus.VALID);
    expect(result.response.lowestUsedTimestamp).to.equal(
      dbBlock.timestamp.toString(),
    );
  });

  it('uses lowerQueryWindowBlock.timestamp as LUT at the fork boundary', () => {
    const dbBlock = makeBlock({ timestamp: CBHE_LUT_FORK_TIMESTAMP });
    const lowerQueryWindowBlock = makeBlock({
      blockNumber: 90,
      timestamp: CBHE_LUT_FORK_TIMESTAMP - 100,
    });

    const result = responseConfirmedBlockHeightExists(
      dbBlock,
      lowerQueryWindowBlock,
      numberOfConfirmations,
      makeRequest(),
    );

    expect(result.status).to.equal(AttestationResponseStatus.VALID);
    expect(result.response.lowestUsedTimestamp).to.equal(
      lowerQueryWindowBlock.timestamp.toString(),
    );
  });

  it('uses lowerQueryWindowBlock.timestamp as LUT after the fork', () => {
    const dbBlock = makeBlock({ timestamp: CBHE_LUT_FORK_TIMESTAMP + 1000 });
    const lowerQueryWindowBlock = makeBlock({
      blockNumber: 90,
      timestamp: CBHE_LUT_FORK_TIMESTAMP + 500,
    });

    const result = responseConfirmedBlockHeightExists(
      dbBlock,
      lowerQueryWindowBlock,
      numberOfConfirmations,
      makeRequest(),
    );

    expect(result.status).to.equal(AttestationResponseStatus.VALID);
    expect(result.response.lowestUsedTimestamp).to.equal(
      lowerQueryWindowBlock.timestamp.toString(),
    );
  });
});
