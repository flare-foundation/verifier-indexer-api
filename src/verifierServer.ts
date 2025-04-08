import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ChainType, extractVerifierType } from './config/configuration';
import { BtcVerifierServerModule } from './verifier-modules/btc-verifier-server.module';
import { DogeVerifierServerModule } from './verifier-modules/doge-verifier-server.module';
import { IJsonApiVerifierServerModule } from './verifier-modules/ijson-api-verifier-sever.module';
import { XRPVerifierServerModule } from './verifier-modules/xrp-verifier-server.module';
import * as express from 'express';

function moduleForDataSource():
  | typeof DogeVerifierServerModule
  | typeof BtcVerifierServerModule
  | typeof XRPVerifierServerModule {
  const verifier_type = extractVerifierType();
  switch (verifier_type) {
    case ChainType.DOGE:
      return DogeVerifierServerModule;
    case ChainType.BTC:
      return BtcVerifierServerModule;
    case ChainType.XRP:
      return XRPVerifierServerModule;
    case ChainType.WEB2:
      return IJsonApiVerifierServerModule;
    default:
      throw new Error(`Wrong verifier type: '${process.env.VERIFIER_TYPE}'`);
  }
}

export async function runVerifierServer() {
  const moduleClass = moduleForDataSource();
  const app = await NestFactory.create(moduleClass);

  const logger = new Logger();

  app.use(helmet());
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(express.json({ limit: '1mb' }));
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
    .setBasePath(basePath)
    .setDescription('Verifier and indexer server over an indexer database.')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'X-API-KEY')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${basePath}/api-doc`, app, document);

  // TODO: type safe config module
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3120;
  const VERIFIER_TYPE = extractVerifierType();
  logger.log(`Verifier type: ${VERIFIER_TYPE}`);

  await app.listen(PORT, '0.0.0.0', () =>
    logger.log(`Server started listening at http://0.0.0.0:${PORT}`),
  );
}
