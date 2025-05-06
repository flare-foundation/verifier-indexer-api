import { expect } from 'chai';
import {
  checkJsonDepthAndKeys,
  HTTP_METHOD,
  isApplicationJsonContentType,
  isJqMessage,
  isJson,
  isValidHttpMethod,
  parseJsonWithDepthAndKeysValidation,
  runChildProcess,
  tryParseJson,
} from '../../../src/verification/web-2-json/utils';

describe('Utils unit tests', () => {
  it('Should reject - not isJson', () => {
    const input0 = () => {};
    const input1 = Symbol('a');
    const input2 = undefined;
    const input3 = { a: () => {} };
    const input4 = [1, 'x', undefined];
    expect(isJson(input0)).to.be.false;
    expect(isJson(input1)).to.be.false;
    expect(isJson(input2)).to.be.false;
    expect(isJson(input3)).to.be.false;
    expect(isJson(input4)).to.be.false;
  });

  it('Should reject - not "object" in "tryParseJson"', () => {
    const input0 = 'null';
    const input1 = '42';
    const input2 = 'true';
    const input3 = '"string"';
    expect(tryParseJson(input0)).to.be.null;
    expect(tryParseJson(input1)).to.be.null;
    expect(tryParseJson(input2)).to.be.null;
    expect(tryParseJson(input3)).to.be.null;
  });

  it('Should return true in "tryParseJson"', () => {
    expect(isValidHttpMethod(HTTP_METHOD.GET, '*')).to.be.true;
  });

  it('Should return true in "isApplicationJsonContentType"', () => {
    expect(isApplicationJsonContentType('application/json')).to.be.true;
    expect(
      isApplicationJsonContentType(['application/xml', 'application/json']),
    ).to.be.true;
  });

  it('Should return false in "isApplicationJsonContentType"', () => {
    expect(isApplicationJsonContentType(['text/plain'])).to.be.false;
    expect(isApplicationJsonContentType(undefined)).to.be.false;
  });

  it('Should return null in "parseJsonWithDepthAndKeysValidation"', () => {
    const maxDepth = 3;
    const maxKeys = 10;
    const input0 = '123';
    const input1 = '{invalid}';
    const input2 = '{"a":{"b":{"c":{"d":1}}}}';
    const input3 = JSON.stringify(
      Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i])),
    );
    expect(parseJsonWithDepthAndKeysValidation(input0, maxDepth, maxKeys)).to.be
      .null;
    expect(parseJsonWithDepthAndKeysValidation(input1, maxDepth, maxKeys)).to.be
      .null;
    expect(parseJsonWithDepthAndKeysValidation(input2, maxDepth, maxKeys)).to.be
      .null;
    expect(parseJsonWithDepthAndKeysValidation(input3, maxDepth, maxKeys)).to.be
      .null;
  });

  it('Should return null in "parseJsonWithDepthAndKeysValidation"', () => {
    const maxDepth = 3;
    const maxKeys = 10;
    const input0 = '123';
    const input1 = '{invalid}';
    const input2 = '{"a":{"b":{"c":{"d":1}}}}';
    const input3 = JSON.stringify(
      Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i])),
    );
    const input4 = '[[[[[[[42]]]]]]]';
    expect(parseJsonWithDepthAndKeysValidation(input0, maxDepth, maxKeys)).to.be
      .null;
    expect(parseJsonWithDepthAndKeysValidation(input1, maxDepth, maxKeys)).to.be
      .null;
    expect(parseJsonWithDepthAndKeysValidation(input2, maxDepth, maxKeys)).to.be
      .null;
    expect(parseJsonWithDepthAndKeysValidation(input3, maxDepth, maxKeys)).to.be
      .null;
    expect(parseJsonWithDepthAndKeysValidation(input4, maxDepth, maxKeys)).to.be
      .null;
  });

  it('Should return valid in "checkJsonDepthAndKeys"', () => {
    const maxDepth = 3;
    const maxKeys = 10;
    const input0 = [];
    const input1 = [[1, 2], [3]];
    expect(checkJsonDepthAndKeys(input0, maxDepth, maxKeys).isValid).to.be.true;
    expect(checkJsonDepthAndKeys(input1, maxDepth, maxKeys).isValid).to.be.true;
  });

  it('Should return null in "runChildProcess"', async () => {
    const scriptPath0 = 'jq-process.js';
    const scriptPath1 = 'encode-process.js';
    const scriptPath2 = 'invalid-process.js';
    const timeoutMs = 1;
    const timeoutErrorMessage = 'Error';
    const input = {};
    expect(
      await runChildProcess(scriptPath0, input, timeoutMs, timeoutErrorMessage),
    ).to.be.null;
    expect(
      await runChildProcess(scriptPath1, input, timeoutMs, timeoutErrorMessage),
    ).to.be.null;
    expect(
      await runChildProcess(scriptPath2, input, timeoutMs, timeoutErrorMessage),
    ).to.be.null;
  });
});
