import { apiJsonTestConfig } from './helper';
import { isValidUrl } from '../../../src/verification/web-jq-v-1_7_1/utils';
import { expect } from 'chai';
import * as jqw from 'jq-wasm';

describe('URL checker', () => {
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
});
