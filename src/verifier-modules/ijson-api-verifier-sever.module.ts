import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { IJsonApiVerifierController } from '../controllers/ijson-api-verifier.controller';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { IJsonApiVerifierService } from '../services/ijson-api-verifier.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [IJsonApiVerifierController],
  providers: [ApiKeyStrategy, AuthService, IJsonApiVerifierService],
})
export class IJsonApiVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
