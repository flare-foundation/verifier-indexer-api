import { apiJsonTestConfig } from '../../e2e_tests/web2/helper';
import { isValidUrl } from '../../../src/verification/web-2-json/utils';
import { expect } from 'chai';

describe('URL unit tests', () => {
  it('Should reject - private IP 1', async () => {
    const input = 'https://%31%32%37%2e0.0.1';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - private IP 2', async () => {
    const input = 'https://0177.0.0.0x1    /halo';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - private IP 3', async () => {
    const input = 'https://0x7f.0x0.0x0.0x1';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - private IP 4', async () => {
    const input = 'https://0177.0.0.01';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - private IP 5', async () => {
    const input = 'https://0177.0.0.0x1';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - private IP 6', async () => {
    const input = 'https://localhost:3000';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - private IP 6', async () => {
    const input = 'https://localhost:3000';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - private IP 7', async () => {
    const input = 'https://0x7f000001';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - too long input url', async () => {
    const longQueryValue = 'a'.repeat(
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    const input = `https://example.com/search?q=${longQueryValue}`;
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject URL - too long url after sanitization', async () => {
    const base = 'https://example.com/search?q=hello world&q=';
    const neededChars =
      apiJsonTestConfig.securityConfig.maxUrlLength - 1 - base.length;
    const longQueryValue = 'a'.repeat(neededChars);
    const input = `${base}${longQueryValue}`;
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - invalid domain', async () => {
    const input = 'https://nonexistent1234abcdef.tld';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - invalidation error', async () => {
    const input = 'https://[invalid-url';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });

  it('Should reject - contains suspicious word "url"', async () => {
    const input = 'https://example.com/badurl?next=redirect';
    const checkedUrl = await isValidUrl(
      input,
      [],
      apiJsonTestConfig.securityConfig.maxUrlLength,
    );
    expect(checkedUrl).to.be.null;
  });
});
