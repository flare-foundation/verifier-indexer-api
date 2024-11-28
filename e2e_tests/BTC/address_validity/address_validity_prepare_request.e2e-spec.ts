import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as request from "supertest";
import { BtcVerifierServerModule } from '../../../src/verifier-modules/btc-verifier-server.module';


describe("Math Functions", () => {
    let app: INestApplication;

    before(async () => {
        app = await NestFactory.create(BtcVerifierServerModule);

        app.use(helmet());
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        app.enableCors();

        await app.listen(3120, '0.0.0.0');
    })

    after(async () => {
        await app.close();
    })

    it("should correctly add two numbers", () => {
        const payload = {
            attestationType: "0x4164647265737356616c69646974790000000000000000000000000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                addressStr: "n1wpzSW3HmzZMryyZtRznY8T6pDbym0000f"
            }
        }
        request(app.getHttpServer())
            .post("/AddressValidity/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .end(function (err, res) {
                if (err) { console.log(res.body); throw err }
                else { console.log(res.body) };
            });
    });
})




