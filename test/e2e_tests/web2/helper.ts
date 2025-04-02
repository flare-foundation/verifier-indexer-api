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
import {
  ChainType
} from '../../../src/config/configuration';
import { IJsonApiVerifierController } from '../../../src/controllers/ijson-api-verifier.controller';
import { LoggerMiddleware } from '../../../src/middleware/LoggerMiddleware';
import { IJsonApiVerifierService } from '../../../src/services/ijson-api-verifier.service';
import { IJsonApiConfig } from 'src/config/interfaces/json-api';
import { VerifierServerConfig, IConfig } from 'src/config/interfaces/common';
import { HTTP_METHOD } from '../../../src/verification/json-api/utils';

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

  const apiJsonDefaultConfig: IJsonApiConfig = {
    securityConfig: {
      blockHostnames: ["www.google.com"],
      blockJq: [],
      blockJson: [],
      jqVersion: '1.7.1',
    },
    sourceConfig: {
      requiresApiKey: false,
      allowedMethods: [HTTP_METHOD.GET],
      allowedEndPoints: '*',
      maxResponseSize: 1024 * 1024,
      maxTimeout: 1000,
      maxRedirects: 0
    },
  };

  const config: IConfig = {
    port: parseInt(process.env.PORT || '3120'),
    api_keys,
    verifierConfigOptions: apiJsonDefaultConfig,
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
  controllers: [IJsonApiVerifierController],
  providers: [ApiKeyStrategy, AuthService, IJsonApiVerifierService],
})
export class IJsonApiVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export let app: INestApplication;

before(async () => {
  app = await NestFactory.create(IJsonApiVerifierServerModule);

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
  attestationType: "0x494a736f6e417069000000000000000000000000000000000000000000000000",
  sourceId: "0x7465737457454232000000000000000000000000000000000000000000000000",
  requestBody: {
    url: "https://jsonplaceholder.typicode.com/todos/1",
    http_method: "GET",
    headers: "{\"Content-Type\":\"application/json\"}",
    query_params: "{}",
    body: "{}",
    postprocess_jq: ".title",
    abi_signature: "{\"internalType\": \"string\",\"name\": \"title\",\"type\": \"string\"}"
  }
};
export const attResponse = {
  attestationType: "0x494a736f6e417069000000000000000000000000000000000000000000000000",
  sourceId: "0x7465737457454232000000000000000000000000000000000000000000000000",
  votingRound: "0",
  lowestUsedTimestamp: "0",
  requestBody: {
    url: "https://jsonplaceholder.typicode.com/todos/1",
    http_method: "GET",
    headers: "{\"Content-Type\":\"application/json\"}",
    query_params: "{}",
    body: "{}",
    postprocess_jq: ".title",
    abi_signature: "{\"internalType\": \"string\",\"name\": \"title\",\"type\": \"string\"}"
  },
  responseBody: {
    abi_encoded_data:
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
          name: 'http_method',
          type: 'string',
        },
        {
          "internalType": "string",
          "name": "headers",
          "type": "string"
        },
        {
          internalType: 'string',
          name: 'query_params',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'body',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'postprocess_jq',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'abi_signature',
          type: 'string',
        },
      ],
      internalType: 'struct IJsonApi.RequestBody',
      name: 'requestBody',
      type: 'tuple',
    },
    {
      components: [
        {
          internalType: 'bytes',
          name: 'abi_encoded_data',
          type: 'bytes',
        },
      ],
      internalType: 'struct IJsonApi.ResponseBody',
      name: 'responseBody',
      type: 'tuple',
    },
  ],
  internalType: 'struct IJsonApi.Response',
  name: '_response',
  type: 'tuple',
};
export const abiEncodedData =
  '0x' +
  '0000000000000000000000000000000000000000000000000000000000000020' +
  '0000000000000000000000000000000000000000000000000000000000000012' +
  '64656c65637475732061757420617574656d0000000000000000000000000000';