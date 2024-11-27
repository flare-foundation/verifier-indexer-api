import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyStrategy } from 'src/auth/apikey.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { XRPBalanceDecreasingTransactionVerifierController } from 'src/controllers/balance-decreasing-transaction-verifier.controller';
import { XRPConfirmedBlockHeightExistsVerifierController } from 'src/controllers/confirmed-block-height-exists-verifier.controller';
import { XrpIndexerController } from 'src/controllers/indexer.controller';
import { XRPPaymentVerifierController } from 'src/controllers/payment-verifier.controller';
import { XRPReferencedPaymentNonexistenceVerifierController } from 'src/controllers/referenced-payment-nonexistence-verifier.controller';
import { XRPBalanceDecreasingTransactionVerifierService } from 'src/services/balance-decreasing-transaction-verifier.service';
import { XRPConfirmedBlockHeightExistsVerifierService } from 'src/services/confirmed-block-height-exists-verifier.service';
import { XRPPaymentVerifierService } from 'src/services/payment-verifier.service';
import { XRPReferencedPaymentNonexistenceVerifierService } from 'src/services/referenced-payment-nonexistence-verifier.service';
import configuration, { IConfig } from '../config/configuration';
import { XRPAddressValidityVerifierController } from '../controllers/address-validity-verifier.controller';
import { XRPAddressValidityVerifierService } from '../services/address-validity-verifier.service';
import { XrpExternalIndexerEngineService } from 'src/services/indexer-services/xrp-indexer.service';
import { XRPHealthController } from 'src/controllers/health.controller';

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
    XRPHealthController,
    XrpIndexerController,
    XRPAddressValidityVerifierController,
    XRPBalanceDecreasingTransactionVerifierController,
    XRPConfirmedBlockHeightExistsVerifierController,
    XRPPaymentVerifierController,
    XRPReferencedPaymentNonexistenceVerifierController,
  ],
  providers: [
    ApiKeyStrategy,
    AuthService,
    XrpExternalIndexerEngineService,
    XRPAddressValidityVerifierService,
    XRPBalanceDecreasingTransactionVerifierService,
    XRPConfirmedBlockHeightExistsVerifierService,
    XRPPaymentVerifierService,
    XRPReferencedPaymentNonexistenceVerifierService,
  ],
})
export class XRPVerifierServerModule {}
