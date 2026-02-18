import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { FLREVMTransactionVerifierService } from '../services/evm-transaction-verifier.service';
import { FLREVMTransactionVerifierController } from '../controllers/evm-verifier.controller';
import { FLRHealthController } from '../controllers/evm-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [FLREVMTransactionVerifierController, FLRHealthController],
  providers: [ApiKeyStrategy, AuthService, FLREVMTransactionVerifierService],
})
export class FLRVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
