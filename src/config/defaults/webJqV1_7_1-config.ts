import { WebJqV1_7_1Config } from '../interfaces/webJqV1_7_1';

export const apiJsonDefaultConfig: WebJqV1_7_1Config = {
  securityConfig: {
    blockHostnames: [],
    blockJq: [],
    blockJson: [],
    maxResponseSize: 1024 * 1024,
    maxRedirects: 1,
    maxResponseTimeout: 1000,
    maxUrlLength: 2084,
    maxHeaders: 50,
    maxQueryParams: 50,
    maxBodyJsonDepth: 10,
    maxBodyJsonKeys: 5000,
    maxJqFilterLength: 5000,
    jqTimeout: 500,
  },
  sourceConfig: {
    requiresApiKey: false,
    allowedMethods: '*',
    allowedEndPoints: '*',
  },
};
