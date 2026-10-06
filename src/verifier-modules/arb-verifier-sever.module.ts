import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { EVMHealthController } from '../controllers/evm-health.controller';
import { EvmNodeEngineService } from '../services/evm-services/evm-node-engine.service';
import { ARBEVMTransactionVerifierController } from '../controllers/evm-verifier.controller';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { ARBEVMTransactionVerifierService } from '../services/evm-transaction-verifier.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [EVMHealthController, ARBEVMTransactionVerifierController],
  providers: [
    ApiKeyStrategy,
    AuthService,
    EvmNodeEngineService,
    ARBEVMTransactionVerifierService,
  ],
})
export class ARBVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
