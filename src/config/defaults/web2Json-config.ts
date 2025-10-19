import { Web2JsonConfig } from '../interfaces/web2Json';

export const apiJsonDefaultConfig: Web2JsonConfig = {
  securityConfig: {
    blockHostnames: [],
    allowedHostnames: [],
    maxResponseSize: 1024 * 1024,
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
  },
  sourceConfig: {
    requiresApiKey: false,
    allowedMethods: '*',
    allowedEndPoints: '*',
  },
};
