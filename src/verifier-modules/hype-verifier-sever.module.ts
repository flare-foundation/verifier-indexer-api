import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { HYPEHealthController } from '../controllers/evm-health.controller';
import { HYPEEVMTransactionVerifierController } from '../controllers/evm-verifier.controller';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { HYPEEVMTransactionVerifierService } from '../services/evm-transaction-verifier.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [HYPEEVMTransactionVerifierController, HYPEHealthController],
  providers: [ApiKeyStrategy, AuthService, HYPEEVMTransactionVerifierService],
})
export class HYPEVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
