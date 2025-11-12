import { AuthType, HTTP_METHOD, Web2JsonSource } from './interfaces/web2-json';

export const WEB2_JSON_SOURCES: Web2JsonSource[] = [
  {
    sourceId: 'Twitter',
    endpoints: [
      {
        host: 'api2.twitter.com',
        paths: [
          {
            path: '/3/tweets',
            postProcessJq: '.data',
          },
        ],
        methods: [HTTP_METHOD.GET],
        auth: { type: AuthType.BEARER, keyEnvVar: 'TWITTER_BEARER' },
      },
    ],
  },
  {
    sourceId: 'Kalmia',
    endpoints: [
      {
        host: 'proxy.kalmia.com',
        paths: '*',
        methods: [HTTP_METHOD.GET],
        auth: {
          type: AuthType.APIKEY,
          keyEnvVar: 'KALMIA_KEY',
          header: 'x-api-key',
        },
      },
    ],
  },
  {
    sourceId: 'TestAPI',
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
