import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from '../auth/apikey.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import configuration from '../config/configuration';
import { Web2JsonVerifierController } from '../controllers/web-2-json-verifier.controller';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { Web2JsonVerifierService } from '../services/web-2-json-verifier.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [Web2JsonVerifierController],
  providers: [ApiKeyStrategy, AuthService, Web2JsonVerifierService],
})
export class Web2JsonVerifierServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
