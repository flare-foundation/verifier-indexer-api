import { ChainType } from '@flarenetwork/mcc';
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
  getApiKeys,
  getDatabaseEntities,
} from '../../../src/config/configuration';
import { DOGEAddressValidityVerifierController } from '../../../src/controllers/address-validity-verifier.controller';
import { DOGEBalanceDecreasingTransactionVerifierController } from '../../../src/controllers/balance-decreasing-transaction-verifier.controller';
import { DOGEConfirmedBlockHeightExistsVerifierController } from '../../../src/controllers/confirmed-block-height-exists-verifier.controller';
import { DOGEHealthController } from '../../../src/controllers/health.controller';
import { DOGEIndexerController } from '../../../src/controllers/indexer.controller';
import { DOGEPaymentVerifierController } from '../../../src/controllers/payment-verifier.controller';
import { DOGEReferencedPaymentNonexistenceVerifierController } from '../../../src/controllers/referenced-payment-nonexistence-verifier.controller';
import { LoggerMiddleware } from '../../../src/middleware/LoggerMiddleware';
import { DOGEAddressValidityVerifierService } from '../../../src/services/address-validity-verifier.service';
import { DOGEBalanceDecreasingTransactionVerifierService } from '../../../src/services/balance-decreasing-transaction-verifier.service';
import { DOGEConfirmedBlockHeightExistsVerifierService } from '../../../src/services/confirmed-block-height-exists-verifier.service';
import { DogeExternalIndexerEngineService } from '../../../src/services/indexer-services/utxo-indexer.service';
import { DOGEPaymentVerifierService } from '../../../src/services/payment-verifier.service';
import { DOGEReferencedPaymentNonexistenceVerifierService } from '../../../src/services/referenced-payment-nonexistence-verifier.service';
import { IndexerConfig } from 'src/config/interfaces/chain-indexer';
import { VerifierServerConfig, IConfig } from 'src/config/interfaces/common';

function getConfig() {
  const api_keys = getApiKeys();
  const verifier_type = ChainType.DOGE;
  const isTestnet = process.env.TESTNET == 'true';

  let database = 'db';
  const isCoverage = process.env.RUNNING_ALL_TESTS == 'true';
  if (isCoverage) {
    database = 'dbdoge';
  }

  const db = {
    database: database,
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
    DOGEHealthController,
    DOGEIndexerController,
    DOGEAddressValidityVerifierController,
    DOGEBalanceDecreasingTransactionVerifierController,
    DOGEConfirmedBlockHeightExistsVerifierController,
    DOGEPaymentVerifierController,
    DOGEReferencedPaymentNonexistenceVerifierController,
  ],
  providers: [
    ApiKeyStrategy,
    AuthService,
    DogeExternalIndexerEngineService,
    DOGEAddressValidityVerifierService,
    DOGEBalanceDecreasingTransactionVerifierService,
    DOGEConfirmedBlockHeightExistsVerifierService,
    DOGEPaymentVerifierService,
    DOGEReferencedPaymentNonexistenceVerifierService,
  ],
})
export class DogeVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export let app: INestApplication;

before(async () => {
  app = await NestFactory.create(DogeVerifierServerModule);

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  await app.listen(3122, '0.0.0.0');
});

after(async () => {
  await app.close();
});
