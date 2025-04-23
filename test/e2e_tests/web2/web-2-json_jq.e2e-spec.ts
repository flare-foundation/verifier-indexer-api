import { expect } from 'chai';
import * as jq from 'jq-wasm';
import { runJqSeparately } from '../../../src/verification/web-2-json/web-2-json-verifications';

const jqProcessTimeoutMs = 500;

describe('jq checker', () => {
  it('Should reject 1 - infinite recursion', async () => {
    const json = {};
    const jqFilter = 'def loop: loop; loop';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 2 - heavy computation', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'reduce range(1; 10000000) as $i (0; . + ($i * $i))';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 3 - Fibonacci-like object mutation over a huge range', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter =
      'reduce range(1; 10000000) as $i ({a: 1, b: 1}; {a: .b, b: (.a + .b)})';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 4 - generate massive output', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'range(1; 10000000) | reduce . as $item (0; . + $item)';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 5 - huge per-item output', async () => {
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

  it('Should reject 6 - deeply nested JSON', async () => {
    const json = JSON.parse('{"a":'.repeat(1000) + '"end"' + '}'.repeat(1000));
    const jqFilter = '.a';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 7 - include external module', async () => {
    const json = {};
    const jqFilter = 'include "some_unwanted_module"';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 8 - generate massive result', async () => {
    const json = {};
    const jqFilter = '["a"] * 1000000';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 9 - malformed jq', async () => {
    const json = {};
    const jqFilter = 'if true then "ok" else "bad"';
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

  it('Should reject 10 - recursion', async () => {
    const json = {};
    const jqFilter = 'def boom: . + [boom]; boom';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    console.log(res);
    expect(res).to.be.null;
  });

  it('Should reject 11 - file access', async () => {
    const json = {};
    const jqFilter = 'input_filename';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.eq('/dev/stdin');
  });

  it('Should reject 12 - system command', async () => {
    const json = {};
    const jqFilter = 'system("ls")';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 13 - eval command', async () => {
    const json = {};
    const jqFilter = 'eval("2 + 2")';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 14 - @sh', async () => {
    const json = { input: '$(ls)' };
    const jqFilter = '@sh';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.be.null;
  });

  it('Should reject 15 - unauthorized file access in jq process', async () => {
    const json = { input_filename: '/etc/passwd' };
    const jqScheme = 'input_filename';
    const res = await runJqSeparately(json, jqScheme, 5000);
    expect(res).to.eq('/dev/stdin');
  });
});
