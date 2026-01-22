import { AuthType, HTTP_METHOD, Web2JsonSource } from '../interfaces/web2-json';

/**
 * Special source allowing access to any public Web2 JSON endpoint without restrictions.
 * Only available on testnets.
 */
export const PUBLIC_WEB2: Web2JsonSource = {
  sourceId: 'PublicWeb2',
  endpoints: [],
};

/** Allowed Web2Json sources definitions for testnet deployments. */
export const WEB2_JSON_TEST_SOURCES: Web2JsonSource[] = [
  PUBLIC_WEB2,
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
];
