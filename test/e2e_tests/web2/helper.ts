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
import { Web2JsonVerifierService } from '../../../src/services/web2-json-verifier.service';
import {
  HTTP_METHOD,
  Web2JsonConfig,
} from '../../../src/config/interfaces/web2-json';
import {
  IConfig,
  VerifierServerConfig,
} from '../../../src/config/interfaces/common';
import { web2JsonDefaultParams } from '../../../src/config/defaults/web2-json-config';
import { ProcessPoolService } from '../../../src/verification/web-2-json/process-pool.service';
import { payload, payload2, payload3, payload4, payload5 } from './payloads';

export const web2JsonTestConfig: Web2JsonConfig = {
  securityParams: web2JsonDefaultParams,
  sources: [payload, payload2, payload3, payload4, payload5].map((p, i) => {
    const url = new URL(p.requestBody.url).hostname;
    return {
      sourceId: `testSource${i + 1}`,
      endpoints: [
        {
          host: url,
          paths: '*',
          methods: [HTTP_METHOD.GET],
        },
      ],
    };
  }),
};

function getConfig() {
  const verifier_type = ChainType.Web2;
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
    web2JsonConfig: web2JsonTestConfig,
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
        const config: Web2JsonConfig = configService.get('web2JsonConfig');
        return new ProcessPoolService(
          config.securityParams.processingTimeoutMs,
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
