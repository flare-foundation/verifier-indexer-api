import { AuthType, HTTP_METHOD, Web2JsonSource } from '../interfaces/web2-json';

/** Allowed Web2Json source definitions for mainnet deployments. */
export const WEB2_JSON_SOURCES: Web2JsonSource[] = [
  {
    sourceId: 'Ignite',
    endpoints: [
      {
        host: 'api-proxy.ignitemarket.xyz',
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
