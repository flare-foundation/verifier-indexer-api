import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyStrategy } from 'src/auth/apikey.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { DOGEPaymentVerifierController } from 'src/controllers/payment-verifier.controller';
import { DOGEBalanceDecreasingTransactionVerifierService } from 'src/services/balance-decreasing-transaction-verifier.service';
import configuration, { IConfig } from '../config/configuration';
import { DOGEAddressValidityVerifierController } from '../controllers/address-validity-verifier.controller';
import { DOGEIndexerController } from '../controllers/indexer-controllers/utxo-indexer.controller';
import { DOGEAddressValidityVerifierService } from '../services/address-validity-verifier.service';
import { DOGEPaymentVerifierService } from 'src/services/payment-verifier.service';
import { DOGEConfirmedBlockHeightExistsVerifierService } from 'src/services/confirmed-block-height-exists-verifier.service';
import { DOGEReferencedPaymentNonexistenceVerifierService } from 'src/services/referenced-payment-nonexistence-verifier.service';
import { UtxoExternalIndexerEngineService } from 'src/services/indexer-services/utxo-indexer.service';
import { DOGEBalanceDecreasingTransactionVerifierController } from 'src/controllers/balance-decreasing-transaction-verifier.controller';
import { DOGEConfirmedBlockHeightExistsVerifierController } from 'src/controllers/confirmed-block-height-exists-verifier.controller';
import { DOGEReferencedPaymentNonexistenceVerifierController } from 'src/controllers/referenced-payment-nonexistence-verifier.controller';

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
    ApiKeyStrategy,
    AuthService,
    UtxoExternalIndexerEngineService,
    DOGEAddressValidityVerifierService,
    DOGEBalanceDecreasingTransactionVerifierService,
    DOGEConfirmedBlockHeightExistsVerifierService,
    DOGEPaymentVerifierService,
    DOGEReferencedPaymentNonexistenceVerifierService,
  ],
})
export class VerifierDogeServerModule {}
