import { AuthType, HTTP_METHOD, Web2JsonSource } from '../interfaces/web2-json';

/** Allowed Web2Json sources definitions for testnet deployments. */
export const WEB2_JSON_TEST_SOURCES: Web2JsonSource[] = [
  {
    sourceId: 'testIgnite',
    endpoints: [
      {
        host: 'api-proxy-dev.ignitemarket.xyz',
        paths: '*',
        methods: [HTTP_METHOD.GET],
        auth: {
          type: AuthType.APIKEY,
          env: 'IGNITE_API_KEY',
          header: 'x-api-key',
        },
      },
    ],
  },
  {
    sourceId: 'testAPIs',
    endpoints: [
      {
        host: 'jsonplaceholder.typicode.com',
        paths: ['/todos'],
        methods: [HTTP_METHOD.GET],
      },
    ],
  },
];
