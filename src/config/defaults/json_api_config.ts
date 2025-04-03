import { IJsonApiConfig } from '../interfaces/json-api';

export const apiJsonDefaultConfig: IJsonApiConfig = {
  securityConfig: {
    blockHostnames: [],
    blockJq: [],
    blockJson: [],
  },
  sourceConfig: {
    requiresApiKey: false,
    allowedMethods: '*',
    allowedEndPoints: '*',
    maxResponseSize: 1024 * 1024,
    maxRedirects: 1,
    maxTimeout: 1000,
  },
};
