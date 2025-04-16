import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ApiKeyStrategy } from '../../../src/auth/apikey.strategy';
import { AuthModule } from '../../../src/auth/auth.module';
import { AuthService } from '../../../src/auth/auth.service';
import { ChainType } from '../../../src/config/configuration';
import { WebJqV1_7_1VerifierController } from '../../../src/controllers/web-jq-v-1_7_1-verifier.controller';
import { LoggerMiddleware } from '../../../src/middleware/LoggerMiddleware';
import { WebJqV1_7_1VerifierService } from '../../../src/services/web-jq-v-1_7_1-verifier.service';
import { WebJqV1_7_1Config } from 'src/config/interfaces/webJqV1_7_1';
import { VerifierServerConfig, IConfig } from 'src/config/interfaces/common';
import { HTTP_METHOD } from '../../../src/verification/web-jq-v-1_7_1/utils';
import { apiJsonDefaultConfig } from '../../../src/config/defaults/webJqV1_7_1-config';

export const apiJsonTestConfig: WebJqV1_7_1Config = {
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
  const verifier_type = ChainType.WEB2;
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
  controllers: [WebJqV1_7_1VerifierController],
  providers: [ApiKeyStrategy, AuthService, WebJqV1_7_1VerifierService],
})
export class WebJqV1_7_1VerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export let app: INestApplication;

before(async () => {
  app = await NestFactory.create(WebJqV1_7_1VerifierServerModule);

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  await app.listen(3123, '0.0.0.0');
});

after(async () => {
  await app.close();
});

// constants used in test
const api_keys = process.env.API_KEYS?.split(',') || [''];
export const api_key = api_keys[0];
export const payload = {
  attestationType:
    '0x5765624a7156315f375f31000000000000000000000000000000000000000000',
  sourceId:
    '0x7465737457454232000000000000000000000000000000000000000000000000',
  requestBody: {
    url: 'https://jsonplaceholder.typicode.com/todos',
    httpMethod: 'GET',
    headers: '{"Content-Type":"application/json"}',
    queryParams: '{"id": 1}',
    body: '{}',
    postProcessJq: '.[0].title',
    abiSignature:
      '{"internalType": "string","name": "title","type": "string"}',
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
      internalType: 'struct WebJqV1_7_1.RequestBody',
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
      internalType: 'struct WebJqV1_7_1.ResponseBody',
      name: 'responseBody',
      type: 'tuple',
    },
  ],
  internalType: 'struct WebJqV1_7_1.Response',
  name: '_response',
  type: 'tuple',
};
export const abiEncodedData =
  '0x' +
  '0000000000000000000000000000000000000000000000000000000000000020' +
  '0000000000000000000000000000000000000000000000000000000000000012' +
  '64656c65637475732061757420617574656d0000000000000000000000000000';
