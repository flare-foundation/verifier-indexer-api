import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as jq from 'jq-wasm';
import { runJqSeparately } from '../../../src/verification/web-2-json/web-2-json-verifications';
import { isJqMessage } from '../../../src/verification/web-2-json/utils';

use(chaiAsPromised);

const jqProcessTimeoutMs = 500;

describe('jq unit tests', () => {
  it('Should reject - infinite recursion', async () => {
    const json = {};
    const jqFilter = 'def loop: loop; loop';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('jq process exceeded timeout');
  });

  it('Should reject - heavy computation', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'reduce range(1; 10000000) as $i (0; . + ($i * $i))';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('jq process exceeded timeout');
  });

  it('Should reject - Fibonacci-like object mutation over a huge range', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter =
      'reduce range(1; 10000000) as $i ({a: 1, b: 1}; {a: .b, b: (.a + .b)})';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('jq process exceeded timeout');
  });

  it('Should reject - generate massive output', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'range(1; 10000000) | reduce . as $item (0; . + $item)';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('jq process exceeded timeout');
  });

  it('Should reject - huge per-item output', async () => {
    const json = {
      data: [
        { a: 1, b: 1 },
        { c: 1, d: 1 },
        { e: 1, f: 1 },
      ],
    };
    const jqFilter =
      '.data[] | {a: .a, b: .b, c: (.a + .b), d: range(1; 1000000)}';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('jq process exceeded timeout');
  });

  it('Should reject - deeply nested JSON', async () => {
    const json = JSON.parse('{"a":'.repeat(1000) + '"end"' + '}'.repeat(1000));
    const jqFilter = '.a';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('Exceeds depth limit for parsing');
  });

  it('Should reject - include external module', async () => {
    const json = {};
    const jqFilter = 'include "some_unwanted_module"';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('syntax error, unexpected end of file');
  });

  it('Should reject - generate massive result', async () => {
    const json = {};
    const jqFilter = '["a"] * 1000000';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith(
      'array (["a"]) and number (1000000) cannot be multiplied',
    );
  });

  it('Should reject - malformed jq', async () => {
    const json = {};
    const jqFilter = 'if true then "ok" else "bad"';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('error: syntax error, unexpected end of file');
  });

  it('Should succeed - github issues', async () => {
    //https://github.com/owenthereal/jq-wasm/issues/2
    const input = { foo: 'bar', list: [1, 2, 3] };
    const rawResult = await jq.raw(input, '.list | .[]', ['-c']);
    expect(rawResult.stdout).to.eq('1\n2\n3');
    const result = await jq.json(input, '.foo');
    expect(result).to.eq('bar');
  });

  it('Should reject - recursion', async () => {
    const json = {};
    const jqFilter = 'def boom: . + [boom]; boom';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('Aborted().');
  });

  it('Should reject - file access', async () => {
    const json = {};
    const jqFilter = 'input_filename';
    const res = await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
    expect(res).to.eq('/dev/stdin');
  });

  it('Should reject - system command', async () => {
    const json = {};
    const jqFilter = 'system("ls")';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('system/1 is not defined');
  });

  it('Should reject - eval command', async () => {
    const json = {};
    const jqFilter = 'eval("2 + 2")';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('eval/1 is not defined');
  });

  it('Should reject - @sh', async () => {
    const json = { input: '$(ls)' };
    const jqFilter = '@sh';
    await expect(
      runJqSeparately(json, jqFilter, jqProcessTimeoutMs),
    ).to.be.rejectedWith('can not be escaped for shell');
  });

  it('Should reject - unauthorized file access in jq process', async () => {
    const json = { input_filename: '/etc/passwd' };
    const jqScheme = 'input_filename';
    const res = await runJqSeparately(json, jqScheme, 5000);
    expect(res).to.eq('/dev/stdin');
  });

  it('Should reject - invalid format', () => {
    const input1 = null;
    const input2 = 'not an object';
    const input3 = {};
    const input4 = { jsonData: {}, jqScheme: 123 };
    const input5 = { jsonData: 42, jqScheme: 'scheme' };
    const input6 = { jqScheme: 'scheme' };
    const input7 = { jsonData: {} };
    expect(isJqMessage(input1)).to.be.false;
    expect(isJqMessage(input2)).to.be.false;
    expect(isJqMessage(input3)).to.be.false;
    expect(isJqMessage(input4)).to.be.false;
    expect(isJqMessage(input5)).to.be.false;
    expect(isJqMessage(input6)).to.be.false;
    expect(isJqMessage(input7)).to.be.false;
  });

  it('Should not reject', () => {
    const input1 = { jsonData: null, jqScheme: '123' };
    const input2 = { jsonData: 'string', jqScheme: 'scheme' };
    expect(isJqMessage(input1)).to.be.true;
    expect(isJqMessage(input2)).to.be.true;
  });
});
