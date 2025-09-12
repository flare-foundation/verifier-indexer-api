import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AttestationResponseStatus } from '../../../src/verification/response-status';
import {
  checkJsonDepthAndKeys,
  parseJsonExpectingObject,
  parseJsonWithDepthAndKeysValidation,
} from '../../../src/verification/web-2-json/validate-json';

use(chaiAsPromised);

describe('Validate-json unit tests', () => {
  it('Should reject - not "object" in "parseJsonExpectingObject"', () => {
    const inputs = ['null', '42', 'true', '"string"'];
    for (const input of inputs) {
      expect(() =>
        parseJsonExpectingObject(input, AttestationResponseStatus.INVALID),
      ).to.throw('Parsed value is not an object');
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
});
