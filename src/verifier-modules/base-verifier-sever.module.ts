import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { BASEEVMTransactionVerifierService } from '../services/evm-transaction-verifier.service';
import { BASEEVMTransactionVerifierController } from '../controllers/evm-verifier.controller';
import { EVMHealthController } from '../controllers/evm-health.controller';
import { EvmNodeEngineService } from '../services/evm-services/evm-node-engine.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [EVMHealthController, BASEEVMTransactionVerifierController],
  providers: [
    ApiKeyStrategy,
    AuthService,
    EvmNodeEngineService,
    BASEEVMTransactionVerifierService,
  ],
})
export class BASEVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
