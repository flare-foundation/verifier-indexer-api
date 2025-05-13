import { expect } from 'chai';
import {
  checkJsonDepthAndKeys,
  HTTP_METHOD,
  isStringArray,
  parseJsonExpectingObject,
  parseJsonWithDepthAndKeysValidation,
  runChildProcess,
  validateApplicationJsonContentType,
  validateHttpMethod,
} from '../../../src/verification/web-2-json/utils';
import { AttestationResponseStatus } from '../../../src/verification/response-status';

describe('Utils unit tests', () => {
  it('Should reject - not "object" in "parseJsonExpectingObject"', () => {
    const inputs = ['null', '42', 'true', '"string"'];
    for (const input of inputs) {
      try {
        parseJsonExpectingObject(input, AttestationResponseStatus.INVALID);
        throw new Error(`Expected error not thrown for input: ${input}`);
      } catch (err) {
        expect(err.message).to.include('Parsed value is not an object');
      }
    }
  });

  it('Should not throw in "validateHttpMethod"', () => {
    expect(() => validateHttpMethod(HTTP_METHOD.GET, '*')).to.not.throw();
  });

  it('Should not throw in "validateApplicationJsonContentType"', () => {
    expect(() =>
      validateApplicationJsonContentType('application/json'),
    ).to.not.throw();
    expect(() =>
      validateApplicationJsonContentType([
        'application/xml',
        'application/json',
      ]),
    ).to.not.throw();
  });

  it('Should throw in "validateApplicationJsonContentType"', () => {
    const inputs = ['text/plain', undefined];
    for (const input of inputs) {
      expect(() => validateApplicationJsonContentType(input)).to.throw(
        'Invalid response content type',
      );
    }
  });

  it('Should throw in "parseJsonWithDepthAndKeysValidation"', () => {
    const maxDepth = 3;
    const maxKeys = 10;
    const input0 = '123';
    const input1 = '{invalid}';
    const input2 = '{"a":{"b":{"c":{"d":1}}}}';
    const input3 = JSON.stringify(
      Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, i])),
    );
    const input4 = [
      {
        a: {
          b: {
            c: {
              d: {
                e: 'too deep',
              },
            },
          },
        },
      },
    ];
    expect(() =>
      parseJsonWithDepthAndKeysValidation(
        input0,
        maxDepth,
        maxKeys,
        AttestationResponseStatus.INVALID,
      ),
    ).to.throw('Parsed value is not an object');
    expect(() =>
      parseJsonWithDepthAndKeysValidation(
        input1,
        maxDepth,
        maxKeys,
        AttestationResponseStatus.INVALID,
      ),
    ).to.throw('SyntaxError');
    expect(() =>
      parseJsonWithDepthAndKeysValidation(
        input2,
        maxDepth,
        maxKeys,
        AttestationResponseStatus.INVALID,
      ),
    ).to.throw('Exceeded max depth');
    expect(() =>
      parseJsonWithDepthAndKeysValidation(
        input3,
        maxDepth,
        maxKeys,
        AttestationResponseStatus.INVALID,
      ),
    ).to.throw('Exceeded max keys');
    expect(() =>
      parseJsonWithDepthAndKeysValidation(
        JSON.stringify(input4),
        maxDepth,
        maxKeys,
        AttestationResponseStatus.INVALID,
      ),
    ).to.throw('Exceeded max depth');
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
    try {
      await runChildProcess(scriptPath0, input, timeoutMs, timeoutErrorMessage);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Invalid message format for jq process');
    }
    try {
      await runChildProcess(scriptPath1, input, timeoutMs, timeoutErrorMessage);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include(
        'Invalid message format for encode process',
      );
    }
    try {
      await runChildProcess(scriptPath2, input, timeoutMs, timeoutErrorMessage);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include(`Unsupported script path: ${scriptPath2}`);
    }
  });

  it('Should return true for string array', () => {
    const data = ['apple', 'banana', 'cherry'];
    const result = isStringArray(data);
    expect(result).to.be.true;
  });

  it('Should return false for non string array or similar', () => {
    const inputs = [
      [1, 2, 3],
      ['apple', 42, 'banana'],
      'not an array',
      null,
      { key: 'value' },
      123,
    ];
    for (const input of inputs) {
      expect(isStringArray(input)).to.be.false;
    }
  });
});
