import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration, { IConfig } from '../config/configuration';
import { XRPAddressValidityVerifierController } from '../controllers/address-validity-verifier.controller';
import { XRPBalanceDecreasingTransactionVerifierController } from '../controllers/balance-decreasing-transaction-verifier.controller';
import { XRPConfirmedBlockHeightExistsVerifierController } from '../controllers/confirmed-block-height-exists-verifier.controller';
import { XRPHealthController } from '../controllers/health.controller';
import { XrpIndexerController } from '../controllers/indexer.controller';
import { XRPPaymentVerifierController } from '../controllers/payment-verifier.controller';
import { XRPReferencedPaymentNonexistenceVerifierController } from '../controllers/referenced-payment-nonexistence-verifier.controller';
import { XRPAddressValidityVerifierService } from '../services/address-validity-verifier.service';
import { XRPBalanceDecreasingTransactionVerifierService } from '../services/balance-decreasing-transaction-verifier.service';
import { XRPConfirmedBlockHeightExistsVerifierService } from '../services/confirmed-block-height-exists-verifier.service';
import { XrpExternalIndexerEngineService } from '../services/indexer-services/xrp-indexer.service';
import { XRPPaymentVerifierService } from '../services/payment-verifier.service';
import { XRPReferencedPaymentNonexistenceVerifierService } from '../services/referenced-payment-nonexistence-verifier.service';
import { XRPHealthController } from '../controllers/health.controller';

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
export class XRPVerifierServerModule { }
