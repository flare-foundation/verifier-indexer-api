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

function getConfig() {
  const api_keys = process.env.API_KEYS?.split(',') || [''];
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
      blockUrls: [],
      blockJq: [],
      blockJson: [],
      jqVersion: '1.7.1',
    },
    sourceConfig: {
      requiresApiKey: false,
      allowedMethods: '*',
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
