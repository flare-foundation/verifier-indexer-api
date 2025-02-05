import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JsonApiVerifierController } from '../controllers/jason-api-verifier.controller';
import { JsonApiVerifierService } from '../services/json-api-verifier.service';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [JsonApiVerifierController],
  providers: [ApiKeyStrategy, AuthService, JsonApiVerifierService],
})
export class JsonApiVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
