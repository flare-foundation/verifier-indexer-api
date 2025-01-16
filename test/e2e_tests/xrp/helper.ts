import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { XRPVerifierServerModule } from '../../../src/verifier-modules/xrp-verifier-server.module';

export let app: INestApplication;

before(async () => {
    app = await NestFactory.create(XRPVerifierServerModule);

    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();

    await app.listen(3120, '0.0.0.0');
})

after(async () => {
    await app.close();
})