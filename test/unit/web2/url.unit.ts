import { sanitizeUrl } from '@braintree/sanitize-url';
import { isValidUrl } from '../../../src/verification/web-2-json/utils';
import { apiJsonTestConfig } from '../../e2e_tests/web2/helper';
import { expect } from 'chai';

describe('URL unit tests', () => {
  it('Should reject - encoded IPv4 localhost', async () => {
    const input = 'https://%31%32%37%2e0.0.1';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Blocked IP: 127.0.0.1 from 127.0.0.1');
    }
  });

  it('Should reject - mixed octal and hex IPv4', async () => {
    const input = 'https://0177.0.0.0x1    /halo';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Invalid protocol: about');
    }
  });

  it('Should reject - hex IPv4', async () => {
    const input = 'https://0x7f.0x0.0x0.0x1';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Blocked IP: 127.0.0.1 from 127.0.0.1');
    }
  });

  it('Should reject - octal IPv4', async () => {
    const input = 'https://0177.0.0.01';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Blocked IP: 127.0.0.1 from 127.0.0.1');
    }
  });

  it('Should reject - mixed base IPv4', async () => {
    const input = 'https://0177.0.0.0x1';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Blocked IP: 127.0.0.1 from 127.0.0.1');
    }
  });

  it('Should reject - localhost', async () => {
    const input = 'https://localhost:3000';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Blocked IP: ::1 from localhost');
    }
  });

  it('Should reject - integer IPv4', async () => {
    const input = 'https://0x7f000001';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Blocked IP: 127.0.0.1 from 127.0.0.1');
    }
  });

  it('Should reject - IPv6-mapped IPv4', async () => {
    const input = 'https://::ffff:127.0.0.1';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Invalid URL');
    }
  });

  it('Should reject - IPv6 localhost', async () => {
    const input = 'https://::1';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Invalid URL');
    }
  });

  it('Should reject - too long input url', async () => {
    const longQueryValue = 'a'.repeat(
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    const input = `https://example.com/search?q=${longQueryValue}`;
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include(
        `URL too long before sanitization: ${input.length}`,
      );
    }
  });

  it('Should reject URL - too long url after sanitization', async () => {
    const base = 'https://example.com/search?q=hello world&q=';
    const neededChars =
      apiJsonTestConfig.securityConfig.maxUrlLength - 1 - base.length;
    const longQueryValue = 'a'.repeat(neededChars);
    const input = `${base}${longQueryValue}`;
    const sanitizedInputUrl = sanitizeUrl(input);
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include(
        `URL too long after sanitization: ${sanitizedInputUrl.length}`,
      );
    }
  });

  it('Should reject - invalid domain', async () => {
    const input = 'https://nonexistent1234abcdef.tld';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include(
        'DNS resolution failed for nonexistent1234abcdef.tld',
      );
    }
  });

  it('Should reject - invalidation error', async () => {
    const input = 'https://[invalid-url';
    try {
      await isValidUrl(
        input,
        [],
        [],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Invalid protocol: about');
    }
  });

  it('Should not reject - allowed hostname', async () => {
    const input = 'https://www.Google.com/';
    const checkedUrl = await isValidUrl(
      input,
      [],
      ['google.com'],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.eq(input.toLocaleLowerCase());
  });

  it('Should reject - not allowed hostname', async () => {
    const input = 'https://www.Google.com/';
    try {
      await isValidUrl(
        input,
        [],
        ['bing.com'],
        apiJsonTestConfig.securityConfig.maxUrlLength,
      );
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Hostname not in allowed list');
    }
  });
});
