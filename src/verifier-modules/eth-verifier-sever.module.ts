import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { ETHEVMTransactionVerifierService } from '../services/evm-transaction-verifier.service';
import { ETHEVMTransactionVerifierController } from '../controllers/evm-verifier.controller';
import { ETHHealthController } from '../controllers/evm-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [ETHEVMTransactionVerifierController, ETHHealthController],
  providers: [ApiKeyStrategy, AuthService, ETHEVMTransactionVerifierService],
})
export class ETHVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
