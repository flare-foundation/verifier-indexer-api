import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { BtcVerifierServerModule } from '../../../src/verifier-modules/btc-verifier-server.module';


describe("Math Functions", () => {
    let app: INestApplication

    beforeAll(async () => {
        const app = await NestFactory.create(BtcVerifierServerModule);

        app.use(helmet());
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        app.enableCors();

        await app.listen(3120, '0.0.0.0');
    })


    it("should correctly add two numbers", () => {
        // return request(app.getHttpServer())
        //     .post("/AddressValidity/prepareRequest")
        //     .expect(200)
        console.log("test")
    });
})




