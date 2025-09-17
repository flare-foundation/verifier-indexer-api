import { sanitizeUrl } from '@braintree/sanitize-url';
import { apiJsonTestConfig } from '../../e2e_tests/web2/helper';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  validateHttpMethod,
  validateUrl,
} from '../../../src/verification/web-2-json/validate-url';
import { HTTP_METHOD } from '../../../src/config/interfaces/web2Json';

use(chaiAsPromised);

describe('Validate-url unit tests', () => {
  it('Should not throw in "validateHttpMethod"', () => {
    expect(() => validateHttpMethod(HTTP_METHOD.GET, '*')).to.not.throw();
  });

  it('Should reject - encoded IPv4 localhost', async () => {
    const input = 'https://%31%32%37%2e0.0.1';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Blocked IP: 127.0.0.1 from 127.0.0.1');
  });

  it('Should reject - mixed octal and hex IPv4', async () => {
    const input = 'https://0177.0.0.0x1    /halo';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Invalid protocol: about');
  });

  it('Should reject - hex IPv4', async () => {
    const input = 'https://0x7f.0x0.0x0.0x1';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Blocked IP: 127.0.0.1 from 127.0.0.1');
  });

  it('Should reject - octal IPv4', async () => {
    const input = 'https://0177.0.0.01';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Blocked IP: 127.0.0.1 from 127.0.0.1');
  });

  it('Should reject - mixed base IPv4', async () => {
    const input = 'https://0177.0.0.0x1';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Blocked IP: 127.0.0.1 from 127.0.0.1');
  });

  it('Should reject - localhost', async () => {
    const input = 'https://localhost:3000';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Blocked IP: ::1 from localhost');
  });

  it('Should reject - integer IPv4', async () => {
    const input = 'https://0x7f000001';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Blocked IP: 127.0.0.1 from 127.0.0.1');
  });

  it('Should reject - IPv6-mapped IPv4', async () => {
    const input = 'https://::ffff:127.0.0.1';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Invalid URL');
  });

  it('Should reject - IPv6 localhost', async () => {
    const input = 'https://::1';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Invalid URL');
  });

  it('Should reject - too long input url', async () => {
    const longQueryValue = 'a'.repeat(
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    const input = `https://example.com/search?q=${longQueryValue}`;
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith(`URL too long before sanitization: ${input.length}`);
  });

  it('Should reject URL - too long url after sanitization', async () => {
    const base = 'https://example.com/search?q=hello world&q=';
    const neededChars =
      apiJsonTestConfig.securityConfig.maxUrlLength - 1 - base.length;
    const longQueryValue = 'a'.repeat(neededChars);
    const input = `${base}${longQueryValue}`;
    const sanitizedInputUrl = sanitizeUrl(input);
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith(
      `URL too long after sanitization: ${sanitizedInputUrl.length}`,
    );
  });

  it('Should reject - invalid domain', async () => {
    const input = 'https://nonexistent1234abcdef.tld';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('DNS resolution failed for nonexistent1234abcdef.tld');
  });

  it('Should reject - invalidation error', async () => {
    const input = 'https://[invalid-url';
    await expect(
      validateUrl(input, [], [], apiJsonTestConfig.securityConfig.maxUrlLength),
    ).to.be.rejectedWith('Invalid protocol: about');
  });

  it('Should not reject - allowed hostname', async () => {
    const input = 'https://www.Google.com/';
    const checkedUrl = await validateUrl(
      input,
      [],
      ['google.com'],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl.url).to.eq(input.toLocaleLowerCase());
  });

  it('Should reject - not allowed hostname', async () => {
    const input = 'https://www.Google.com/';
    await expect(
      validateUrl(
        input,
        [],
        ['bing.com'],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      ),
    ).to.be.rejectedWith('Hostname not in allowed list');
  });
});
