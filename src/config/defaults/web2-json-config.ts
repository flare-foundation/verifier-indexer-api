import { Web2JsonSecurityParams } from '../interfaces/web2-json';

export const web2JsonDefaultParams: Web2JsonSecurityParams = {
  maxResponseSize: 100 * 1024,
  maxRedirects: 0,
  requestTimeoutMs: 5_000,
  maxUrlLength: 2_000,
  maxHeaders: 15,
  maxQueryParams: 15,
  maxBodyJsonDepth: 6,
  maxBodyJsonKeys: 500,
  maxJqFilterLength: 5_000,
  maxAbiSignatureLength: 5_000,
  processingTimeoutMs: 1_000,
};
