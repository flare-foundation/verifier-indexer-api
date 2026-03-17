import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { VerifierType, extractVerifierType } from './config/configuration';
import { BtcVerifierServerModule } from './verifier-modules/btc-verifier-server.module';
import { DogeVerifierServerModule } from './verifier-modules/doge-verifier-server.module';
import { Web2JsonVerifierServerModule } from './verifier-modules/web-2-json-verifier-sever.module';
import { XRPVerifierServerModule } from './verifier-modules/xrp-verifier-server.module';
import * as express from 'express';
import { FLRVerifierServerModule } from './verifier-modules/flr-verifier-sever.module';
import { ETHVerifierServerModule } from './verifier-modules/eth-verifier-sever.module';
import { SGBVerifierServerModule } from './verifier-modules/sgb-verifier-sever.module';
import { BASEVerifierServerModule } from './verifier-modules/base-verifier-sever.module';
import { HYPEVerifierServerModule } from './verifier-modules/hype-verifier-sever.module';

function moduleForDataSource():
  | typeof DogeVerifierServerModule
  | typeof BtcVerifierServerModule
  | typeof XRPVerifierServerModule
  | typeof Web2JsonVerifierServerModule
  | typeof ETHVerifierServerModule
  | typeof SGBVerifierServerModule
  | typeof FLRVerifierServerModule
  | typeof BASEVerifierServerModule
  | typeof HYPEVerifierServerModule {
  const verifier_type = extractVerifierType();
  switch (verifier_type) {
    case VerifierType.DOGE:
      return DogeVerifierServerModule;
    case VerifierType.BTC:
      return BtcVerifierServerModule;
    case VerifierType.XRP:
      return XRPVerifierServerModule;
    case VerifierType.Web2:
      return Web2JsonVerifierServerModule;
    case VerifierType.ETH:
      return ETHVerifierServerModule;
    case VerifierType.SGB:
      return SGBVerifierServerModule;
    case VerifierType.FLR:
      return FLRVerifierServerModule;
    case VerifierType.BASE:
      return BASEVerifierServerModule;
    case VerifierType.HYPE:
      return HYPEVerifierServerModule;
    default:
      throw new Error(`Wrong verifier type: '${process.env.VERIFIER_TYPE}'`);
  }
}

export async function runVerifierServer() {
  const moduleClass = moduleForDataSource();
  const app = await NestFactory.create(moduleClass);

  const logger = new Logger();

  app.use(helmet());
  app.use(express.urlencoded({ extended: true })); // default limit: '100kb'
  app.use(express.json()); // default limit: '100kb'
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  const verifierType = process.env.VERIFIER_TYPE?.toUpperCase();
  const basePath = process.env.APP_BASE_PATH ?? '';

  app.setGlobalPrefix(basePath);
  const config = new DocumentBuilder()
    .setTitle(
      `Verifier and indexer server (${
        process.env.TESTNET == 'true' ? 'test' : ''
      }${verifierType})`,
    )
    .setDescription('Verifier and indexer server over an indexer database.')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'X-API-KEY')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${basePath}/api-doc`, app, document);

  // TODO: type safe config module
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3120;
  const VERIFIER_TYPE = extractVerifierType();
  logger.log(`Verifier type: ${VerifierType[VERIFIER_TYPE]}`);

  await app.listen(PORT, '0.0.0.0', () =>
    logger.log(`Server started listening at http://0.0.0.0:${PORT}`),
  );
}
