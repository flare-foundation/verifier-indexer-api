import { sanitizeUrl } from '@braintree/sanitize-url';
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {
  parseUrl,
  validateHttpMethod,
  validatePath,
  validateUrl,
} from '../../../src/verification/web-2-json/validate-url';
import {
  Endpoint,
  HTTP_METHOD,
} from '../../../src/config/interfaces/web2-json';
import { web2JsonDefaultParams } from '../../../src/config/defaults/web2-json-config';

use(chaiAsPromised);

describe('web-2-json URL validation', () => {
  describe('validateHttpMethod', () => {
    it('Should not throw in "validateHttpMethod"', () => {
      expect(() => validateHttpMethod(HTTP_METHOD.GET, '*')).to.not.throw();
    });
  });

  describe('parseUrl', () => {
    it('Should reject - mixed octal and hex IPv4', () => {
      const input = 'https://0177.0.0.0x1    /halo';
      expect(() =>
        parseUrl(input, web2JsonDefaultParams.maxUrlLength),
      ).to.throw('Invalid protocol: about');
    });

    it('Should reject - IPv6-mapped IPv4', () => {
      const input = 'https://::ffff:127.0.0.1';
      expect(() =>
        parseUrl(input, web2JsonDefaultParams.maxUrlLength),
      ).to.throw('Invalid URL');
    });

    it('Should reject - IPv6 localhost', () => {
      const input = 'https://::1';
      expect(() =>
        parseUrl(input, web2JsonDefaultParams.maxUrlLength),
      ).to.throw('Invalid URL');
    });

    it('Should reject - too long input url', () => {
      const longQueryValue = 'a'.repeat(web2JsonDefaultParams.maxUrlLength);
      const input = `https://example.com/search?q=${longQueryValue}`;
      expect(() =>
        parseUrl(input, web2JsonDefaultParams.maxUrlLength),
      ).to.throw(`URL too long before sanitization: ${input.length}`);
    });

    it('Should reject URL - too long url after sanitization', () => {
      const base = 'https://example.com/search?q=hello world&q=';
      const neededChars = web2JsonDefaultParams.maxUrlLength - 1 - base.length;
      const longQueryValue = 'a'.repeat(neededChars);
      const input = `${base}${longQueryValue}`;
      const sanitizedInputUrl = sanitizeUrl(input);
      expect(() =>
        parseUrl(input, web2JsonDefaultParams.maxUrlLength),
      ).to.throw(
        `URL too long after sanitization: ${sanitizedInputUrl.length}`,
      );
    });

    it('Should reject - invalidation error', () => {
      const input = 'https://[invalid-url';
      expect(() =>
        parseUrl(input, web2JsonDefaultParams.maxUrlLength),
      ).to.throw('Invalid protocol: about');
    });
  });

  describe('validateUrl', () => {
    it('Should reject - encoded IPv4 localhost', async () => {
      const input = new URL('https://%31%32%37%2e0.0.1');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 127.0.0.1 from 127.0.0.1',
      );
    });

    it('Should reject - hex IPv4', async () => {
      const input = new URL('https://0x7f.0x0.0x0.0x1');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 127.0.0.1 from 127.0.0.1',
      );
    });

    it('Should reject - octal IPv4', async () => {
      const input = new URL('https://0177.0.0.01');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 127.0.0.1 from 127.0.0.1',
      );
    });

    it('Should reject - mixed base IPv4', async () => {
      const input = new URL('https://0177.0.0.0x1');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 127.0.0.1 from 127.0.0.1',
      );
    });

    it('Should reject - localhost', async () => {
      const input = new URL('https://localhost:3000');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: ::1 from localhost',
      );
    });

    it('Should reject - IPv4-mapped IPv6 localhost', async () => {
      const input = new URL('https://[::ffff:127.0.0.1]');
      await expect(validateUrl(input)).to.be.rejectedWith(
        /Blocked IP: ::ffff:/,
      );
    });

    it('Should reject - 0.0.0.0/8 range', async () => {
      const input = new URL('https://0.0.0.1');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 0.0.0.1 from 0.0.0.1',
      );
    });

    it('Should reject - CGNAT range 100.64.0.0/10', async () => {
      const input = new URL('https://100.64.0.1');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 100.64.0.1 from 100.64.0.1',
      );
    });

    it('Should reject - TEST-NET-2 range', async () => {
      const input = new URL('https://198.51.100.10');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 198.51.100.10 from 198.51.100.10',
      );
    });

    it('Should reject - IPv4 multicast range', async () => {
      const input = new URL('https://224.0.0.1');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 224.0.0.1 from 224.0.0.1',
      );
    });

    it('Should reject - IPv6 ULA range', async () => {
      const input = new URL('https://[fc00::1]');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: fc00::1 from [fc00::1]',
      );
    });

    it('Should reject - IPv6 documentation range', async () => {
      const input = new URL('https://[2001:db8::1]');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 2001:db8::1 from [2001:db8::1]',
      );
    });

    it('Should reject - IPv6 multicast range', async () => {
      const input = new URL('https://[ff02::1]');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: ff02::1 from [ff02::1]',
      );
    });

    it('Should reject - integer IPv4', async () => {
      const input = new URL('https://0x7f000001');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'Blocked IP: 127.0.0.1 from 127.0.0.1',
      );
    });

    it('Should reject - invalid domain', async () => {
      const input = new URL('https://nonexistent1234abcdef.tld');
      await expect(validateUrl(input)).to.be.rejectedWith(
        'DNS resolution failed for nonexistent1234abcdef.tld',
      );
    });

    it('Should allow - public IPv4 address', async () => {
      const input = new URL('https://1.1.1.1');
      await expect(validateUrl(input)).to.eventually.have.property(
        'hostname',
        '1.1.1.1',
      );
    });

    it('Should allow - public IPv6 address', async () => {
      const input = new URL('https://[2606:4700:4700::1111]');
      await expect(validateUrl(input)).to.eventually.have.property(
        'hostname',
        '[2606:4700:4700::1111]',
      );
    });
  });

  describe('validateEndpointPath', () => {
    it('allows any path when endpoint.paths is "*"', () => {
      const endpoint: Endpoint = {
        host: 'example.com',
        methods: '*',
        paths: '*',
      };
      const parsed = new URL('https://example.com/some/path');
      expect(() => validatePath(parsed, endpoint)).to.not.throw();
    });

    it('allows exact path when endpoint.paths contains a string without leading slash', () => {
      const endpoint: Endpoint = {
        host: 'example.com',
        methods: '*',
        paths: ['allowed'],
      };
      const parsed = new URL('https://example.com/allowed');
      expect(() => validatePath(parsed, endpoint)).to.not.throw();
    });

    it('allows exact path when endpoint.paths contains a string with leading slash', () => {
      const endpoint: Endpoint = {
        host: 'example.com',
        methods: '*',
        paths: ['/allowed2'],
      };
      const parsed = new URL('https://example.com/allowed2');
      expect(() => validatePath(parsed, endpoint)).to.not.throw();
    });

    it('rejects when path is not listed in endpoint.paths', () => {
      const endpoint: Endpoint = {
        host: 'example.com',
        methods: '*',
        paths: ['/only-this'],
      };
      const parsed = new URL('https://example.com/notlisted');
      expect(() => validatePath(parsed, endpoint)).to.throw(
        /Path .* not allowed for source/,
      );
    });
  });
});
