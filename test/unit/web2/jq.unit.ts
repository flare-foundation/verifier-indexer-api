import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { validateJqFilter } from '../../../src/verification/web-2-json/validate-jq';
import { web2JsonDefaultParams } from '../../../src/config/defaults/web2-json-config';
import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';
import { Web2JsonValidationError } from '../../../src/verification/web-2-json/utils';

use(chaiAsPromised);

const jqProcessTimeoutMs = 500;
const maxJqFilterLength = web2JsonDefaultParams.maxJqFilterLength;

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
      'env.PATH',
      // Additional IO/env-related filters
      'input_filename',
      'input_line_number',
      'system("true")',
      'open("data.json"; "r")',
      'load("data.json")',
      'eval(".")',
      'setpath(["a"]; 1)',
      'getpath(["a"])',
      'delpaths([["a"]])',
      // Dynamic invocation
      'call(.)',
      // More looping/recursion forms
      'repeat(.)',
      'recurse_down',
      'recurse_up',
      // Labels and breaks
      'label $out | 0 | while(. < 10; (.+1 | if .==3 then break $out else . end))',
      // Directives that may not be supported by the parser but should never be allowed
      'import "mylib" as m; .',
      'include "mylib"; .',
      'module {namespace: "m"}; .',
    ];

    for (const f of filters) {
      expect(
        () => validateJqFilter(f, maxJqFilterLength),
        `filter "${f}"`,
      ).to.throw(Web2JsonValidationError);
    }
  });

  it('Should accept safe, bounded filters', () => {
    const safeFilters = [
      '.',
      '.a',
      '{x: .a, y: .b}',
      '[.a, .b]',
      '(.a // 0)',
      '(.a | tostring)',
      '(.a | length)',
      'keys',
      'has("a")',
      'select(type == "object")',
      'map(. + 1) | .[:3]',
      '.[0:2]',
      '([.a] | length)',
      '"Hello \\(.name)"',
      '"User: \\(.id) (\\(.score | tostring))"',
      '"abc123" | gsub("[0-9]+"; "N")',
      '"héllo" | explode',
    ];

    for (const f of safeFilters) {
      expect(
        () => validateJqFilter(f, maxJqFilterLength),
        `filter "${f}"`,
      ).to.not.throw();
    }
  });

  it('Should process a complex but safe jq filter', () => {
    const filter = `
{ "outcomeIdx": [1, 0][((.data.time_series | to_entries[] | select(.key == "2025-07-07 16:00:00") | .value.price) // (.data.time_series | to_entries | last | .value.price)) >= 24000 | if . then 0 else 1 end] }
`;
    expect(() => validateJqFilter(filter, maxJqFilterLength)).to.not.throw();
  });

  it('Should reject assignment/update operators (mutations)', () => {
    const mutationFilters = [
      '.a |= 10',
      '.a = 10',
      '.[] |= . + 1',
      '(.a, .b) |= 0',
      '{ output: .a |= 10 }',
    ];

    for (const f of mutationFilters) {
      expect(
        () => validateJqFilter(f, maxJqFilterLength),
        `filter "${f}"`,
      ).to.throw(Web2JsonValidationError);
    }
  });

  it('Should accept allowed binary operators', () => {
    const allowed = [
      '1 + 2',
      '10 - 3',
      '2 * 3',
      '10 / 2',
      '5 % 2',
      '.a == 10',
      '.a != .b',
      '1 < 2',
      '1 <= 2',
      '2 > 1',
      '2 >= 1',
      '(.a // .b)',
      '(.a, .b)',
      '.a and .b',
      '.a or .b',
    ];

    for (const f of allowed) {
      expect(
        () => validateJqFilter(f, maxJqFilterLength),
        `filter "${f}"`,
      ).to.not.throw();
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
    it('Should reject - invalid multiplication', async () => {
      const json = {};
      const jqFilter = '["a"] * 1000000';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, undefined),
      ).to.be.rejectedWith('INVALID: JQ PARSE ERROR');
    });
    it('Should reject - malformed jq', async () => {
      const json = {};
      const jqFilter = 'if true then "ok" else "bad"';
      await expect(
        pool.filterAndEncodeData(json, jqFilter, undefined),
      ).to.be.rejectedWith('INVALID: JQ PARSE ERROR');
    });
  });
});
