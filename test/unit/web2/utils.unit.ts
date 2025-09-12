import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { isStringArray } from '../../../src/verification/web-2-json/utils';
import { HTTP_METHOD } from '../../../src/verification/web-2-json/validate-url';

use(chaiAsPromised);

describe('Utils unit tests', () => {
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
