import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { ARBHealthController } from '../controllers/evm-health.controller';
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
  controllers: [ARBEVMTransactionVerifierController, ARBHealthController],
  providers: [ApiKeyStrategy, AuthService, ARBEVMTransactionVerifierService],
})
export class ARBVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
