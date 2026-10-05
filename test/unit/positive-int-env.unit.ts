import { expect } from 'chai';
import { getPositiveIntEnv } from '../../src/config/env';

describe('getPositiveIntEnv', () => {
  const name = 'TEST_POSITIVE_INT';
  afterEach(() => delete process.env[name]);

  it('returns the default when unset or empty', () => {
    expect(getPositiveIntEnv(name, 5)).to.equal(5);
    process.env[name] = '';
    expect(getPositiveIntEnv(name, 5)).to.equal(5);
  });

  it('accepts a positive integer', () => {
    process.env[name] = '620';
    expect(getPositiveIntEnv(name, 5)).to.equal(620);
  });

  for (const raw of ['0', '-1', '5.5', 'abc', '5s']) {
    it(`rejects '${raw}' at startup`, () => {
      process.env[name] = raw;
      expect(() => getPositiveIntEnv(name, 5)).to.throw(
        `${name} must be a positive integer`,
      );
    });
  }
});
