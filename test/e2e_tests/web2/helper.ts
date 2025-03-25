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
  ChainType,
  getDatabaseEntities,
  IConfig,
  VerifierServerConfig,
} from '../../../src/config/configuration';
import { IJsonApiVerifierController } from '../../../src/controllers/ijson-api-verifier.controller';
import { LoggerMiddleware } from '../../../src/middleware/LoggerMiddleware';
import { IJsonApiVerifierService } from '../../../src/services/ijson-api-verifier.service';

function getConfig() {
  const api_keys = process.env.API_KEYS?.split(',') || [''];
  const verifier_type = ChainType.WEB2;
  const isTestnet = process.env.TESTNET == 'true';

  const db = {
    database: process.env.DB_DATABASE || 'database',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 8080,
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
  };

  const entities = getDatabaseEntities(verifier_type);

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
    verifierConfig,
    db: db,
    typeOrmModuleOptions: {
      ...db,
      type: 'postgres',
      entities: entities,
      synchronize: false,
      migrationsRun: false,
      logging: false,
    },
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
