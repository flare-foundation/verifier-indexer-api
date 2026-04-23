import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import helmet from 'helmet';
import { ApiKeyStrategy } from '../../../src/auth/apikey.strategy';
import { AuthModule } from '../../../src/auth/auth.module';
import { AuthService } from '../../../src/auth/auth.service';
import {
  getDatabaseEntities,
  VerifierType,
} from '../../../src/config/configuration';
import { XRPHealthController } from '../../../src/controllers/health.controller';
import { XrpIndexerController } from '../../../src/controllers/indexer.controller';
import { XRPXRPPaymentVerifierController } from '../../../src/controllers/xrp-payment-verifier.controller';
import { XRPXRPPaymentNonexistenceVerifierController } from '../../../src/controllers/xrp-payment-nonexistence-verifier.controller';
import { LoggerMiddleware } from '../../../src/middleware/LoggerMiddleware';
import { XrpExternalIndexerEngineService } from '../../../src/services/indexer-services/xrp-indexer.service';
import { XRPXRPPaymentVerifierService } from '../../../src/services/xrp-payment-verifier.service';
import { XRPXRPPaymentNonexistenceVerifierService } from '../../../src/services/xrp-payment-nonexistence-verifier.service';
import { IConfig } from '../../../src/config/interfaces/common';
import { IndexerConfig } from '../../../src/config/interfaces/chain-indexer';

function getConfig() {
  const api_keys = process.env.API_KEYS?.split(',') || ['12345'];
  const verifier_type = VerifierType.XRP;
  const isTestnet = false; // mainnet XRP snapshot

  let database = 'db';
  const isCoverage = process.env.RUNNING_ALL_TESTS == 'true';
  if (isCoverage) {
    database = 'dbxrp_mainnet';
  }

  const db = {
    database: database,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 8080,
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
  };

  const entities = getDatabaseEntities(verifier_type);

  const config: IConfig = {
    port: parseInt(process.env.PORT || '3127'),
    apiKeys: api_keys,
    isTestnet,
    verifierType: verifier_type,
    indexerConfig: {
      db,
      typeOrmModuleOptions: {
        ...db,
        type: 'postgres',
        entities: entities,
        synchronize: false,
        migrationsRun: false,
        logging: false,
      },
      numberOfConfirmations: parseInt(
        process.env.NUMBER_OF_CONFIRMATIONS || '6',
      ),
      indexerServerPageLimit: parseInt(
        process.env.INDEXER_SERVER_PAGE_LIMIT || '100',
      ),
    },
  };
  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<IConfig>) => {
        const indexerConfig: IndexerConfig = config.get('indexerConfig');
        if (!indexerConfig?.typeOrmModuleOptions) {
          throw new Error(
            "'typeOrmModuleOptions' is missing in the configuration",
          );
        }
        return indexerConfig.typeOrmModuleOptions;
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [
    XRPHealthController,
    XrpIndexerController,
    XRPXRPPaymentVerifierController,
    XRPXRPPaymentNonexistenceVerifierController,
  ],
  providers: [
    ApiKeyStrategy,
    AuthService,
    XrpExternalIndexerEngineService,
    XRPXRPPaymentVerifierService,
    XRPXRPPaymentNonexistenceVerifierService,
  ],
})
export class XRPMainnetVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export let app: INestApplication;

export function baseHooks() {
  before(async () => {
    app = await NestFactory.create(XRPMainnetVerifierServerModule, {
      logger: false,
    });

    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();

    await app.listen(3127, '0.0.0.0');
  });

  after(async () => {
    await app.close();
  });
}

export function getTestFile(myFile: string) {
  return myFile.slice(myFile.replace(/\\/g, '/').indexOf('test/'));
}
