import { Web2JsonConfig } from '../interfaces/web2Json';

export const apiJsonDefaultConfig: Web2JsonConfig = {
  securityConfig: {
    blockHostnames: [],
    blockJq: [],
    blockJson: [],
    maxResponseSize: 1024 * 1024,
    maxRedirects: 1,
    maxResponseTimeout: 1_000,
    maxUrlLength: 2_000,
    maxHeaders: 15,
    maxQueryParams: 15,
    maxBodyJsonDepth: 6,
    maxBodyJsonKeys: 500,
    maxJqFilterLength: 2_000,
    jqTimeout: 500,
    encodeTimeout: 500,
  },
  sourceConfig: {
    requiresApiKey: false,
    allowedMethods: '*',
    allowedEndPoints: '*',
  },
};
