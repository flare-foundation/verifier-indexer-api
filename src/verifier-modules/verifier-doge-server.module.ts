import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyStrategy } from 'src/auth/apikey.strategy';
import { DogeExternalIndexerEngineService } from 'src/services/doge/doge-indexer.service';
import configuration, { IConfig } from '../config/configuration';
import { DOGEAddressValidityVerifierController } from '../controllers/doge/doge-address-validity-verifier.controller';
import { DOGEBalanceDecreasingTransactionVerifierController } from '../controllers/doge/doge-balance-decreasing-transaction-verifier.controller';
import { DOGEConfirmedBlockHeightExistsVerifierController } from '../controllers/doge/doge-confirmed-block-height-exists-verifier.controller';
import { DOGEIndexerController } from '../controllers/doge/doge-indexer.controller';
import { DOGEPaymentVerifierController } from '../controllers/doge/doge-payment-verifier.controller';
import { DOGEReferencedPaymentNonexistenceVerifierController } from '../controllers/doge/doge-referenced-payment-nonexistence-verifier.controller';
import { DOGEAddressValidityVerifierService } from '../services/doge/doge-address-validity-verifier.service';
import { DOGEBalanceDecreasingTransactionVerifierService } from '../services/doge/doge-balance-decreasing-transaction-verifier.service';
import { DOGEConfirmedBlockHeightExistsVerifierService } from '../services/doge/doge-confirmed-block-height-exists-verifier.service';
import { DOGEPaymentVerifierService } from '../services/doge/doge-payment-verifier.service';
import { DOGEReferencedPaymentNonexistenceVerifierService } from '../services/doge/doge-referenced-payment-nonexistence-verifier.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<IConfig>) =>
        config.get('typeOrmModuleOptions'),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [
    DOGEIndexerController,
    DOGEAddressValidityVerifierController,
    DOGEBalanceDecreasingTransactionVerifierController,
    DOGEConfirmedBlockHeightExistsVerifierController,
    DOGEPaymentVerifierController,
    DOGEReferencedPaymentNonexistenceVerifierController,
  ],
  providers: [
    // {
    //   provide: 'VERIFIER_CONFIG',
    //   useFactory: async () => {
    //     const config = new ExternalDBVerifierConfigurationService();
    //     await config.initialize();
    //     return config;
    //   },
    // },
    // {
    //   provide: 'VERIFIER_PROCESSOR',
    //   useFactory: async (
    //     config: ExternalDBVerifierConfigurationService,
    //     manager: EntityManager,
    //   ) => new DOGEProcessorService(config, manager),
    //   inject: [
    //     { token: 'VERIFIER_CONFIG', optional: false },
    //     { token: getEntityManagerToken('indexerDatabase'), optional: false },
    //   ],
    // },
    DogeExternalIndexerEngineService,
    ApiKeyStrategy,
    AuthService,
    DOGEAddressValidityVerifierService,
    DOGEBalanceDecreasingTransactionVerifierService,
    DOGEConfirmedBlockHeightExistsVerifierService,
    DOGEPaymentVerifierService,
    DOGEReferencedPaymentNonexistenceVerifierService,
  ],
})
export class VerifierDogeServerModule {}
