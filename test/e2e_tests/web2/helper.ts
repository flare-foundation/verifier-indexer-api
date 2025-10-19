import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ApiKeyStrategy } from '../../../src/auth/apikey.strategy';
import { AuthModule } from '../../../src/auth/auth.module';
import { AuthService } from '../../../src/auth/auth.service';
import { ChainType, getApiKeys } from '../../../src/config/configuration';
import { Web2JsonVerifierController } from '../../../src/controllers/web-2-json-verifier.controller';
import { LoggerMiddleware } from '../../../src/middleware/LoggerMiddleware';
import { Web2JsonVerifierService } from '../../../src/services/web-2-json-verifier.service';
import {
  HTTP_METHOD,
  Web2JsonConfig,
} from '../../../src/config/interfaces/web2Json';
import {
  IConfig,
  VerifierServerConfig,
} from '../../../src/config/interfaces/common';
import { apiJsonDefaultConfig } from '../../../src/config/defaults/web2Json-config';
import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';

export const apiJsonTestConfig: Web2JsonConfig = {
  ...apiJsonDefaultConfig,
  securityConfig: {
    ...apiJsonDefaultConfig.securityConfig,
    blockHostnames: ['google.com'],
  },
  sourceConfig: {
    ...apiJsonDefaultConfig.sourceConfig,
    allowedMethods: [HTTP_METHOD.GET],
  },
};

function getConfig() {
  const verifier_type = ChainType.PublicWeb2;
  const isTestnet = process.env.TESTNET == 'true';

  const verifierConfig: VerifierServerConfig = {
    verifierType: verifier_type,
    numberOfConfirmations: parseInt(process.env.NUMBER_OF_CONFIRMATIONS || '6'),
    indexerServerPageLimit: parseInt(
      process.env.INDEXER_SERVER_PAGE_LIMIT || '100',
    ),
  };

  const config: IConfig = {
    port: parseInt(process.env.PORT || '3120'),
    api_keys,
    verifierConfigOptions: apiJsonTestConfig,
    verifierConfig,
    isTestnet,
  };
  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [Web2JsonVerifierController],
  providers: [
    ApiKeyStrategy,
    AuthService,
    Web2JsonVerifierService,
    {
      provide: ProcessPoolService,
      useFactory: (configService: ConfigService<IConfig>) => {
        const config: Web2JsonConfig = configService.get(
          'verifierConfigOptions',
        );
        config.securityConfig.allowedHostnames = ['dog.ceo'].concat(
          [payload, payload2, payload3, payload4].map(
            (p) => new URL(p.requestBody.url).hostname,
          ),
        );
        return new ProcessPoolService(
          config.securityConfig.processingTimeoutMs,
        );
      },
      inject: [ConfigService],
    },
  ],
})
export class Web2JsonVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export let app: INestApplication;

before(async () => {
  app = await NestFactory.create(Web2JsonVerifierServerModule);

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  await app.listen(3125, '0.0.0.0');
});

after(async () => {
  await app.close();
});

// constants used in test
const api_keys = getApiKeys();
export const api_key = api_keys[0];
export const payload = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://jsonplaceholder.typicode.com/todos',
    httpMethod: 'GET',
    headers:
      '{"Content-Type":"application/json","User-Agent":"MySuperDuperApp"}',
    queryParams: '{"id": 1}',
    body: '',
    postProcessJq: '.[0].title',
    abiSignature: '{"internalType": "string","name": "title","type": "string"}',
  },
};
export const payload2 = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://jsonplaceholder.typicode.com/todos',
    httpMethod: 'GET',
    headers: '{"Content-Type":"application/json"}',
    queryParams: '{"userId": 1}',
    body: '',
    postProcessJq: '.[0]',
    abiSignature: `{
          "internalType": "tuple",
          "type": "tuple",
          "components": [
            {
              "internalType": "uint8",
              "name": "userId",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "id",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "completed",
              "type": "bool"
            }
          ]
        }
    `,
  },
};
export const payload3 = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://restcountries.com/v3.1/independent',
    httpMethod: 'GET',
    headers: '',
    queryParams: '{"status": true, "fields": "languages,capital"}',
    body: '',
    postProcessJq: `{ capital1: .[0].capital[0], capital2: .[1].capital[0] }`,
    abiSignature: `{
      "type": "tuple",
      "components": [
        {
          "type": "string",
          "name": "capital1"
        },
        {
          "type": "string",
          "name": "capital2"
        }
      ]
    }`,
  },
};
export const payload4 = {
  attestationType:
    '0x576562324a736f6e000000000000000000000000000000000000000000000000',
  sourceId:
    '0x746573745075626c696357656232000000000000000000000000000000000000',
  requestBody: {
    url: 'https://newsapi.org/v2/everything',
    httpMethod: 'GET',
    headers: '',
    queryParams:
      '{"q": "pocket", "from": "2025-03-23", "to": "2025-03-23", "sortBy": "publishedAt"}',
    body: '',
    postProcessJq: `
          {
            author: .[0].author,
            title:  .[0].title,
          }
        `,
    abiSignature: `
        {
          "type": "tuple",
          "components": [
            { "type": "string", "name": "author" },
            { "type": "string", "name": "title" }
          ]
        }
      
    `,
  },
};
export const attResponse = {
  ...payload,
  votingRound: '0',
  lowestUsedTimestamp: '0',
  responseBody: {
    abiEncodedData:
      '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001264656c65637475732061757420617574656d0000000000000000000000000000',
  },
};
export const abiEncoding: unknown = {
  components: [
    {
      internalType: 'bytes32',
      name: 'attestationType',
      type: 'bytes32',
    },
    { internalType: 'bytes32', name: 'sourceId', type: 'bytes32' },
    { internalType: 'uint64', name: 'votingRound', type: 'uint64' },
    {
      internalType: 'uint64',
      name: 'lowestUsedTimestamp',
      type: 'uint64',
    },
    {
      components: [
        {
          internalType: 'string',
          name: 'url',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'httpMethod',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'headers',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'queryParams',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'body',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'postProcessJq',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'abiSignature',
          type: 'string',
        },
      ],
      internalType: 'struct Web2Json.RequestBody',
      name: 'requestBody',
      type: 'tuple',
    },
    {
      components: [
        {
          internalType: 'bytes',
          name: 'abiEncodedData',
          type: 'bytes',
        },
      ],
      internalType: 'struct Web2Json.ResponseBody',
      name: 'responseBody',
      type: 'tuple',
    },
  ],
  internalType: 'struct Web2Json.Response',
  name: '_response',
  type: 'tuple',
};
export const abiEncodedData =
  '0x' +
  '0000000000000000000000000000000000000000000000000000000000000020' +
  '0000000000000000000000000000000000000000000000000000000000000012' +
  '64656c65637475732061757420617574656d0000000000000000000000000000';
