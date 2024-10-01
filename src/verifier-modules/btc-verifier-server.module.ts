import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyStrategy } from 'src/auth/apikey.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import configuration, { IConfig } from '../config/configuration';
import { BTCAddressValidityVerifierController } from 'src/controllers/address-validity-verifier.controller';
import { BTCBalanceDecreasingTransactionVerifierController } from 'src/controllers/balance-decreasing-transaction-verifier.controller';
import { BTCConfirmedBlockHeightExistsVerifierController } from 'src/controllers/confirmed-block-height-exists-verifier.controller';
import { BTCPaymentVerifierController } from 'src/controllers/payment-verifier.controller';
import { BTCReferencedPaymentNonexistenceVerifierController } from 'src/controllers/referenced-payment-nonexistence-verifier.controller';
import { BTCAddressValidityVerifierService } from 'src/services/address-validity-verifier.service';
import { BTCBalanceDecreasingTransactionVerifierService } from 'src/services/balance-decreasing-transaction-verifier.service';
import { BTCConfirmedBlockHeightExistsVerifierService } from 'src/services/confirmed-block-height-exists-verifier.service';
import { BTCPaymentVerifierService } from 'src/services/payment-verifier.service';
import { BTCReferencedPaymentNonexistenceVerifierService } from 'src/services/referenced-payment-nonexistence-verifier.service';
import { BtcExternalIndexerEngineService } from 'src/services/indexer-services/utxo-indexer.service';
import { BTCIndexerController } from 'src/controllers/indexer.controller';

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
    BTCIndexerController,
    BTCAddressValidityVerifierController,
    BTCBalanceDecreasingTransactionVerifierController,
    BTCConfirmedBlockHeightExistsVerifierController,
    BTCPaymentVerifierController,
    BTCReferencedPaymentNonexistenceVerifierController,
  ],
  providers: [
    ApiKeyStrategy,
    AuthService,
    BtcExternalIndexerEngineService,
    BTCAddressValidityVerifierService,
    BTCBalanceDecreasingTransactionVerifierService,
    BTCConfirmedBlockHeightExistsVerifierService,
    BTCPaymentVerifierService,
    BTCReferencedPaymentNonexistenceVerifierService,
  ],
})
export class BtcVerifierServerModule {}
