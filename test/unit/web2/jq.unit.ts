import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { validateJqFilter } from '../../../src/verification/web-2-json/validate-jq';
import { apiJsonDefaultConfig } from '../../../src/config/defaults/web2Json-config';
import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';

use(chaiAsPromised);

const jqProcessTimeoutMs = 500;
const maxJqFilterLength = apiJsonDefaultConfig.securityConfig.maxJqFilterLength;

let pool: ProcessPoolService;

describe('jq unit tests', () => {
  it('Should reject dangerous or computational filters', () => {
    const filters = [
      // Recursion / infinite loops
      'def loop: loop; loop',
      'def boom: . + [boom]; boom',
      'while(true; .)',
      'until(false; .)',
      // Heavy compute
      'reduce range(1; 10000000) as $i (0; . + ($i * $i))',
      'reduce range(1; 10000000) as $i ({a: 1, b: 1}; {a: .b, b: (.a + .b)})',
      'range(1; 10000000) | reduce . as $item (0; . + $item)',
      'foreach range(0; 10000000) as $i (0; . + $i)',
      // Traversal / potentially explosive
      'walk(.)',
      'recurse(.[])',
      // IO / env / formatting
      'input',
      'inputs',
      'env.PATH'
    ];
    for (const f of filters) {
      expect(
        () => validateJqFilter(f, maxJqFilterLength),
        `filter "${f}"`,
      ).to.throw('Contains potentially dangerous keywords');
    }
  });

  describe('jq processing', () => {
    before(() => {
      pool = new ProcessPoolService(jqProcessTimeoutMs, 1);
      pool.onModuleInit();
    });
    after(() => {
      pool?.onModuleDestroy();
    });

    it('Should reject - deeply nested JSON', async () => {
      const json = JSON.parse(
        '{"a":'.repeat(1000) + '"end"' + '}'.repeat(1000),
      );
      const jqFilter = '.a';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, undefined),
      ).to.be.rejectedWith('Exceeds depth limit for parsing');
    });
    it('Should reject - invalid multiplication', async () => {
      const json = {};
      const jqFilter = '["a"] * 1000000';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, undefined),
      ).to.be.rejectedWith(
        'INVALID: JQ PARSE ERROR',
      );
    });
    it('Should reject - malformed jq', async () => {
      const json = {};
      const jqFilter = 'if true then "ok" else "bad"';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, undefined),
      ).to.be.rejectedWith('INVALID: JQ PARSE ERROR');
    });
    it('Should reject - valid filter but too long to process', async function () {
      const json = { arr: Array(1_000_000).fill(1) };
      // Valid filter, but computationally expensive
      const jqFilter = '.arr | map(. + 1)';
      validateJqFilter(jqFilter, maxJqFilterLength);
      await expect(
        pool.filterAndEncodeData(json, jqFilter, undefined),
      ).to.be.rejectedWith('INVALID: PROCESSING TIMEOUT');
    });
  });
});
