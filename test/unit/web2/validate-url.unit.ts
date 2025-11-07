import { sanitizeUrl } from '@braintree/sanitize-url';
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {
  parseUrl,
  validateHttpMethod,
  validateUrl,
} from '../../../src/verification/web-2-json/validate-url';
import {
  Endpoint,
  HTTP_METHOD,
} from '../../../src/config/interfaces/web2-json';
import { web2JsonDefaultParams } from '../../../src/config/defaults/web2-json-config';

use(chaiAsPromised);

const allowAll: Endpoint = {
  host: '',
  methods: '*',
  paths: '*',
};

describe('Validate-url unit tests', () => {
  it('Should not throw in "validateHttpMethod"', () => {
    expect(() => validateHttpMethod(HTTP_METHOD.GET, '*')).to.not.throw();
  });

  it('Should reject - encoded IPv4 localhost', async () => {
    const input = new URL('https://%31%32%37%2e0.0.1');
    await expect(validateUrl(input, allowAll)).to.be.rejectedWith(
      'Blocked IP: 127.0.0.1 from 127.0.0.1',
    );
  });

  it('Should reject - mixed octal and hex IPv4', () => {
    const input = 'https://0177.0.0.0x1    /halo';
    expect(() => parseUrl(input, web2JsonDefaultParams.maxUrlLength)).to.throw(
      'Invalid protocol: about',
    );
  });

  it('Should reject - hex IPv4', async () => {
    const input = new URL('https://0x7f.0x0.0x0.0x1');
    await expect(validateUrl(input, allowAll)).to.be.rejectedWith(
      'Blocked IP: 127.0.0.1 from 127.0.0.1',
    );
  });

  it('Should reject - octal IPv4', async () => {
    const input = new URL('https://0177.0.0.01');
    await expect(validateUrl(input, allowAll)).to.be.rejectedWith(
      'Blocked IP: 127.0.0.1 from 127.0.0.1',
    );
  });

  it('Should reject - mixed base IPv4', async () => {
    const input = new URL('https://0177.0.0.0x1');
    await expect(validateUrl(input, allowAll)).to.be.rejectedWith(
      'Blocked IP: 127.0.0.1 from 127.0.0.1',
    );
  });

  it('Should reject - localhost', async () => {
    const input = new URL('https://localhost:3000');
    await expect(validateUrl(input, allowAll)).to.be.rejectedWith(
      'Blocked IP: ::1 from localhost',
    );
  });

  it('Should reject - integer IPv4', async () => {
    const input = new URL('https://0x7f000001');
    await expect(validateUrl(input, allowAll)).to.be.rejectedWith(
      'Blocked IP: 127.0.0.1 from 127.0.0.1',
    );
  });

  it('Should reject - IPv6-mapped IPv4', () => {
    const input = 'https://::ffff:127.0.0.1';
    expect(() => parseUrl(input, web2JsonDefaultParams.maxUrlLength)).to.throw(
      'Invalid URL',
    );
  });

  it('Should reject - IPv6 localhost', () => {
    const input = 'https://::1';
    expect(() => parseUrl(input, web2JsonDefaultParams.maxUrlLength)).to.throw(
      'Invalid URL',
    );
  });

  it('Should reject - invalid domain', async () => {
    const input = new URL('https://nonexistent1234abcdef.tld');
    await expect(validateUrl(input, allowAll)).to.be.rejectedWith(
      'DNS resolution failed for nonexistent1234abcdef.tld',
    );
  });

  it('Should reject - too long input url', () => {
    const longQueryValue = 'a'.repeat(web2JsonDefaultParams.maxUrlLength);
    const input = `https://example.com/search?q=${longQueryValue}`;
    expect(() => parseUrl(input, web2JsonDefaultParams.maxUrlLength)).to.throw(
      `URL too long before sanitization: ${input.length}`,
    );
  });

  it('Should reject URL - too long url after sanitization', () => {
    const base = 'https://example.com/search?q=hello world&q=';
    const neededChars = web2JsonDefaultParams.maxUrlLength - 1 - base.length;
    const longQueryValue = 'a'.repeat(neededChars);
    const input = `${base}${longQueryValue}`;
    const sanitizedInputUrl = sanitizeUrl(input);
    expect(() => parseUrl(input, web2JsonDefaultParams.maxUrlLength)).to.throw(
      `URL too long after sanitization: ${sanitizedInputUrl.length}`,
    );
  });

  it('Should reject - invalidation error', () => {
    const input = 'https://[invalid-url';
    expect(() => parseUrl(input, web2JsonDefaultParams.maxUrlLength)).to.throw(
      'Invalid protocol: about',
    );
  });
});
