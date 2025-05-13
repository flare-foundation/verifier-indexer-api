import { expect } from 'chai';
import * as jq from 'jq-wasm';
import { runJqSeparately } from '../../../src/verification/web-2-json/web-2-json-verifications';
import { isJqMessage } from '../../../src/verification/web-2-json/utils';

const jqProcessTimeoutMs = 500;

describe('jq unit tests', () => {
  it('Should reject - infinite recursion', async () => {
    const json = {};
    const jqFilter = 'def loop: loop; loop';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('jq process exceeded timeout');
    }
  });

  it('Should reject - heavy computation', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'reduce range(1; 10000000) as $i (0; . + ($i * $i))';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('jq process exceeded timeout');
    }
  });

  it('Should reject - Fibonacci-like object mutation over a huge range', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter =
      'reduce range(1; 10000000) as $i ({a: 1, b: 1}; {a: .b, b: (.a + .b)})';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('jq process exceeded timeout');
    }
  });

  it('Should reject - generate massive output', async () => {
    const json = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const jqFilter = 'range(1; 10000000) | reduce . as $item (0; . + $item)';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('jq process exceeded timeout');
    }
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
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('jq process exceeded timeout');
    }
  });

  it('Should reject - deeply nested JSON', async () => {
    const json = JSON.parse('{"a":'.repeat(1000) + '"end"' + '}'.repeat(1000));
    const jqFilter = '.a';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Exceeds depth limit for parsing');
    }
  });

  it('Should reject - include external module', async () => {
    const json = {};
    const jqFilter = 'include "some_unwanted_module"';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('syntax error, unexpected end of file');
    }
  });

  it('Should reject - generate massive result', async () => {
    const json = {};
    const jqFilter = '["a"] * 1000000';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include(
        'array (["a"]) and number (1000000) cannot be multiplied',
      );
    }
  });

  it('Should reject - malformed jq', async () => {
    const json = {};
    const jqFilter = 'if true then "ok" else "bad"';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include(
        'error: syntax error, unexpected end of file',
      );
    }
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
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Aborted().');
    }
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
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('system/1 is not defined');
    }
  });

  it('Should reject - eval command', async () => {
    const json = {};
    const jqFilter = 'eval("2 + 2")';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('eval/1 is not defined');
    }
  });

  it('Should reject - @sh', async () => {
    const json = { input: '$(ls)' };
    const jqFilter = '@sh';
    try {
      await runJqSeparately(json, jqFilter, jqProcessTimeoutMs);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('can not be escaped for shell');
    }
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
