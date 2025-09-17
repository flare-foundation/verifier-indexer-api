import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { validateJqFilter } from '../../../src/verification/web-2-json/validate-jq';
import { apiJsonDefaultConfig } from '../../../src/config/defaults/web2Json-config';
import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';
import * as jq from 'jq-wasm';

use(chaiAsPromised);

const jqProcessTimeoutMs = 500;
const maxJqFilterLength = apiJsonDefaultConfig.securityConfig.maxJqFilterLength;

let pool: ProcessPoolService;

describe('jq unit tests', () => {
  it('Should succeed - github issues', async () => {
    //https://github.com/owenthereal/jq-wasm/issues/2
    const input = { foo: 'bar', list: [1, 2, 3] };

    const rawResult = await jq.raw(input, '.list | .[]', ['-c']);
    expect(rawResult.stdout).to.eq('1\n2\n3');
    const result = await jq.json(input, '.foo');
    expect(result).to.eq('bar');
  });

  it('Should reject dangerous or computational filters', () => {
    const filters = [
      'def loop: loop; loop',
      'reduce range(1; 10000000) as $i (0; . + ($i * $i))',
      'reduce range(1; 10000000) as $i ({a: 1, b: 1}; {a: .b, b: (.a + .b)})',
      'range(1; 10000000) | reduce . as $item (0; . + $item)',
      '.data[] | {a: .a, b: .b, c: (.a + .b), d: range(1; 1000000)}',
      'def boom: . + [boom]; boom',
      'system("ls")',
      'eval("2 + 2")',
      '@sh',
      'open(".env")',
    ];
    for (const f of filters) {
      expect(
        () => validateJqFilter(f, maxJqFilterLength),
        `filter "${f}"`,
      ).to.throw('contains potentially dangerous keywords');
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
        pool.filterAndEncodeData(json, jqFilter, {}),
      ).to.be.rejectedWith('Exceeds depth limit for parsing');
    });
    it('Should reject - include external module', async () => {
      const json = {};
      const jqFilter = 'include "some_unwanted_module"';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, {}),
      ).to.be.rejectedWith('syntax error, unexpected end of file');
    });
    it('Should reject - invalid multiplication', async () => {
      const json = {};
      const jqFilter = '["a"] * 1000000';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, {}),
      ).to.be.rejectedWith(
        'array (["a"]) and number (1000000) cannot be multiplied',
      );
    });
    it('Should reject - malformed jq', async () => {
      const json = {};
      const jqFilter = 'if true then "ok" else "bad"';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, {}),
      ).to.be.rejectedWith('error: syntax error, unexpected end of file');
    });
    it('Should reject - valid filter but too long to process', async function () {
      const json = { arr: Array(1_000_000).fill(1) };
      // Valid filter, but computationally expensive
      const jqFilter = '.arr | map(. + 1)';
      validateJqFilter(jqFilter, maxJqFilterLength);
      await expect(
        pool.filterAndEncodeData(json, jqFilter, {}),
      ).to.be.rejectedWith('Filtering and encoding JSON timed out');
    });
  });
});
