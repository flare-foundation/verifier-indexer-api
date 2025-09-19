import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { validateApplicationJsonContentType } from '../../../src/verification/web-2-json/validate-response';

use(chaiAsPromised);

describe('Validate-response unit tests', () => {
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
});
