import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration, { IConfig } from '../config/configuration';
import { DOGEAddressValidityVerifierController } from '../controllers/address-validity-verifier.controller';
import { DOGEBalanceDecreasingTransactionVerifierController } from '../controllers/balance-decreasing-transaction-verifier.controller';
import { DOGEConfirmedBlockHeightExistsVerifierController } from '../controllers/confirmed-block-height-exists-verifier.controller';
import { DOGEHealthController } from '../controllers/health.controller';
import { DOGEIndexerController } from '../controllers/indexer.controller';
import { DOGEPaymentVerifierController } from '../controllers/payment-verifier.controller';
import { DOGEReferencedPaymentNonexistenceVerifierController } from '../controllers/referenced-payment-nonexistence-verifier.controller';
import { DOGEAddressValidityVerifierService } from '../services/address-validity-verifier.service';
import { DOGEBalanceDecreasingTransactionVerifierService } from '../services/balance-decreasing-transaction-verifier.service';
import { DOGEConfirmedBlockHeightExistsVerifierService } from '../services/confirmed-block-height-exists-verifier.service';
import { DogeExternalIndexerEngineService } from '../services/indexer-services/utxo-indexer.service';
import { DOGEPaymentVerifierService } from '../services/payment-verifier.service';
import { DOGEReferencedPaymentNonexistenceVerifierService } from '../services/referenced-payment-nonexistence-verifier.service';
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
