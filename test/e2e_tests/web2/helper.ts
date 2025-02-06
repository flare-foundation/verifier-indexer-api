import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { IJsonApiVerifierServerModule } from '../../../src/verifier-modules/ijson-api-verifier-sever.module';

export let app: INestApplication;

before(async () => {
  app = await NestFactory.create(IJsonApiVerifierServerModule);

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  await app.listen(3123, '0.0.0.0');
});

after(async () => {
  await app.close();
});
