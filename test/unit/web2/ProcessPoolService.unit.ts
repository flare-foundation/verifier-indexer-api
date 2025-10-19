import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';
import { ParamType } from 'ethers';
import { AttestationResponseStatus } from '../../../src/verification/response-status';
import { validateJqFilter } from '../../../src/verification/web-2-json/validate-jq';
import { apiJsonDefaultConfig } from '../../../src/config/defaults/web2Json-config';

use(chaiAsPromised);

const jqProcessTimeoutMs = 200;
const maxJqFilterLength = apiJsonDefaultConfig.securityConfig.maxJqFilterLength;

describe('filterAndEncodeData', () => {
  let pool: ProcessPoolService;

  before(() => {
    pool = new ProcessPoolService(jqProcessTimeoutMs, 1);
    pool.onModuleInit();
  });
  after(() => {
    pool?.onModuleDestroy();
  });

  it('Should process a valid request', async () => {
    const types = ParamType.from('uint256');
    const values = `
    {
      "data": {
        "items": [
          { 
            "valueA": "A",
            "valueB": 1
          }
        ]
      }
    }
    `;
    const jqFilter = '.data.items[0].valueB';
    const result = await pool.filterAndEncodeData(
      JSON.parse(values),
      jqFilter,
      types,
    );
    expect(result).to.eq(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
  });

  // NOTE: This specific jq filter would be rejected earlier during request validation.
  // This test ensures that if a malicious jq filter slips validation, it would still timeout.
  it('Should timeout - malicious jq filter', async () => {
    const types = ParamType.from('bytes');

    await expect(
      pool.filterAndEncodeData([], 'range(0,100000000)', types),
    ).to.be.rejectedWith(AttestationResponseStatus.PROCESSING_TIMEOUT);
  });

  it('Should timeout - valid filter and data but input too large to process', async function () {
    const data = { arr: Array(250_000).fill(1) };
    expect(
      Buffer.byteLength(JSON.stringify(data), 'utf8') <
        apiJsonDefaultConfig.securityConfig.maxResponseSize,
    ).to.be.true;

    const jqFilter = '.arr ' + '| map(. + 1) '.repeat(10) + '| add';
    validateJqFilter(jqFilter, maxJqFilterLength);
    await expect(
      pool.filterAndEncodeData(data, jqFilter, ParamType.from('uint256')),
    ).to.be.rejectedWith('INVALID: PROCESSING TIMEOUT');
  });
});
