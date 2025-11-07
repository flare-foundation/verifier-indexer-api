import { AuthType, HTTP_METHOD, Web2JsonSource } from './interfaces/web2-json';

export const WEB2_MAINNET_SOURCES: Web2JsonSource[] = [
  {
    sourceId: 'Twitter',
    endpoints: [
      {
        host: 'api.twitter.com',
        paths: ['/2/tweets/*'],
        methods: [HTTP_METHOD.GET],
        auth: { type: AuthType.BEARER, keyEnvVar: 'TWITTER_BEARER' },
      },
    ],
  },
];

export const WEB2_TESTNET_SOURCES: Web2JsonSource[] = [
  {
    sourceId: 'TestAPIs',
    endpoints: [
      {
        host: 'jsonplaceholder.typicode.com',
        paths: '*',
        methods: [HTTP_METHOD.GET],
      },
      {
        host: 'restcountries.com',
        paths: ['/v3.1/independent'],
        methods: [HTTP_METHOD.GET],
      },
    ],
  },
];
