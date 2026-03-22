import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import helmet from 'helmet';
import { getApiKeys, VerifierType } from '../../../src/config/configuration';
import { IConfig } from '../../../src/config/interfaces/common';
import { AuthModule } from '../../../src/auth/auth.module';
import { ApiKeyStrategy } from '../../../src/auth/apikey.strategy';
import { AuthService } from '../../../src/auth/auth.service';
import { LoggerMiddleware } from '../../../src/middleware/LoggerMiddleware';
import { FLREVMTransactionVerifierController } from '../../../src/controllers/evm-verifier.controller';
import { FLRHealthController } from '../../../src/controllers/evm-health.controller';
import { FLREVMTransactionVerifierService } from '../../../src/services/evm-transaction-verifier.service';
import { NestFactory } from '@nestjs/core';

function getConfig() {
  const config: IConfig = {
    port: parseInt(process.env.PORT || '3120'),
    apiKeys: api_keys,
    isTestnet: true,
    verifierType: VerifierType.FLR,
    evmRpcUrl:
      process.env.EVM_RPC || 'https://flare-api.flare.network/ext/C/rpc',
  };
  return config;
}
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [FLREVMTransactionVerifierController, FLRHealthController],
  providers: [ApiKeyStrategy, AuthService, FLREVMTransactionVerifierService],
})
export class FLRVerifierServerTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export let app: INestApplication;

export function baseHooks() {
  beforeEach(async () => {
    app = await NestFactory.create(FLRVerifierServerTestModule, { logger: false });

    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();

    await app.listen(3128, '0.0.0.0');
  });

  afterEach(async () => {
    await app.close();
  });
}

// constants used in test
const api_keys = getApiKeys();
export const api_key = api_keys[0];

/**
 * Returns truncated file path.
 * @param file module filename
 * @returns file path from `test/` on, separated by `'/'`
 */
export function getTestFile(myFile: string) {
    return myFile.slice(myFile.replace(/\\/g, "/").indexOf("test/"));
}
