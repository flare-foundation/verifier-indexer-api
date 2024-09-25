import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
// import { VerifierBtcServerModule } from './verifier-btc-server.module';
import { extractVerifierType } from './config/configuration';
import { DogeVerifierServerModule } from './verifier-modules/doge-verifier-server.module';
import { ChainType } from '@flarenetwork/mcc';
import { BtcVerifierServerModule } from './verifier-modules/btc-verifier-server.module';
// import { VerifierXrpServerModule } from './verifier-xrp-server.module';

function moduleForDataSource(): any {
  const verifier_type = extractVerifierType();
  switch (verifier_type) {
    case ChainType.DOGE:
      return DogeVerifierServerModule;
    case ChainType.BTC:
      return BtcVerifierServerModule;
    case ChainType.XRP:
    // return VerifierXrpServerModule;
    default:
      throw new Error(`Wrong verifier type: '${process.env.VERIFIER_TYPE}'`);
  }
}

export async function runVerifierServer() {
  const moduleClass = moduleForDataSource();
  const app = await NestFactory.create(moduleClass);

  const logger = new Logger();

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  const verifierType = process.env.VERIFIER_TYPE?.toUpperCase();
  const basePath = process.env.VERIFIER_SERVER_BASE_PATH ?? '';

  app.setGlobalPrefix(process.env.APP_BASE_PATH ?? '');
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

  app.setGlobalPrefix(basePath);

  // TODO: type safe config module
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3120;
  const VERIFIER_TYPE = extractVerifierType();
  logger.log(`Verifier type: ${VERIFIER_TYPE}`);

  await app.listen(PORT, '0.0.0.0', () =>
    logger.log(`Server started listening at http://0.0.0.0:${PORT}`),
  );

  logger.log(`Websocket server started listening at ws://0.0.0.0:${PORT}`);
}
