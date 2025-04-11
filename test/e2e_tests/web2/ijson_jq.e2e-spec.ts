import { expect } from 'chai';
import * as jq from 'jq-wasm';
import { runJqSeparately } from '../../../src/verification/json-api/utils';

const jqProcessTimeoutMs = 300;

describe('jq checker', () => {
  it('Should reject 1', async () => {
    const json = {};
    const jqFilter = 'def loop: loop; loop';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 2', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'reduce range(1; 10000000) as $i (0; . + ($i * $i))';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 3', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter =
      'reduce range(1; 10000000) as $i ({a: 1, b: 1}; {a: .b, b: (.a + .b)})';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 4', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'range(1; 10000000) | reduce . as $item (0; . + $item)';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 5', async () => {
    const json = {
      data: [
        { a: 1, b: 1 },
        { c: 1, d: 1 },
        { e: 1, f: 1 },
      ],
    };
    const jqFilter =
      '.data[] | {a: .a, b: .b, c: (.a + .b), d: range(1; 1000000)}';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should succeed - github issues', async () => {
    //https://github.com/owenthereal/jq-wasm/issues/2
    const input = { foo: 'bar', list: [1, 2, 3] };
    const rawResult = await jq.raw(input, '.list | .[]', ['-c']);
    expect(rawResult.stdout).to.eq('1\n2\n3');
    const result = await jq.json(input, '.foo');
    expect(result).to.eq('bar');
  });
});
