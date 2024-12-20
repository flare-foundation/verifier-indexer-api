import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration, { IConfig } from '../config/configuration';
import { BTCAddressValidityVerifierController } from '../controllers/address-validity-verifier.controller';
import { BTCBalanceDecreasingTransactionVerifierController } from '../controllers/balance-decreasing-transaction-verifier.controller';
import { BTCConfirmedBlockHeightExistsVerifierController } from '../controllers/confirmed-block-height-exists-verifier.controller';
import { BTCHealthController } from '../controllers/health.controller';
import { BTCIndexerController } from '../controllers/indexer.controller';
import { BTCPaymentVerifierController } from '../controllers/payment-verifier.controller';
import { BTCReferencedPaymentNonexistenceVerifierController } from '../controllers/referenced-payment-nonexistence-verifier.controller';
import { BTCAddressValidityVerifierService } from '../services/address-validity-verifier.service';
import { BTCBalanceDecreasingTransactionVerifierService } from '../services/balance-decreasing-transaction-verifier.service';
import { BTCConfirmedBlockHeightExistsVerifierService } from '../services/confirmed-block-height-exists-verifier.service';
import { BtcExternalIndexerEngineService } from '../services/indexer-services/utxo-indexer.service';
import { BTCPaymentVerifierService } from '../services/payment-verifier.service';
import { BTCReferencedPaymentNonexistenceVerifierService } from '../services/referenced-payment-nonexistence-verifier.service';
import { LoggerMiddleware } from 'src/middlware/LoggerMiddlwar';


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
    BTCHealthController,
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
export class BtcVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
