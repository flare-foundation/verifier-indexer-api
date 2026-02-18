import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { SGBEVMTransactionVerifierService } from '../services/evm-transaction-verifier.service';
import { SGBEVMTransactionVerifierController } from '../controllers/evm-verifier.controller';
import { SGBHealthController } from '../controllers/evm-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [SGBEVMTransactionVerifierController, SGBHealthController],
  providers: [ApiKeyStrategy, AuthService, SGBEVMTransactionVerifierService],
})
export class SGBVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
