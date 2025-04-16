import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { WebJqV1_7_1VerifierController } from '../controllers/web-jq-v-1_7_1-verifier.controller';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { WebJqV1_7_1VerifierService } from '../services/web-jq-v-1_7_1-verifier.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [WebJqV1_7_1VerifierController],
  providers: [ApiKeyStrategy, AuthService, WebJqV1_7_1VerifierService],
})
export class WebJqV1_7_1VerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
