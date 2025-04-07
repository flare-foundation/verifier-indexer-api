import { IJsonApiConfig } from '../interfaces/json-api';

export const apiJsonDefaultConfig: IJsonApiConfig = {
  securityConfig: {
    blockHostnames: [],
    blockJq: [],
    blockJson: [],
    maxResponseSize: 1024 * 1024,
    maxRedirects: 1,
    maxResponseTimeout: 1000,
    maxUrlLength: 2000,
    maxHeaders: 50,
    maxQueryParams: 50,
    maxBodyJsonDepth: 10,
    maxBodyJsonKeys: 5000,
    maxJqFilterLength: 5000,
  },
  sourceConfig: {
    requiresApiKey: false,
    allowedMethods: '*',
    allowedEndPoints: '*',
  },
};
