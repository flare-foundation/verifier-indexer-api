import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";


describe("/BalanceDecreasingTransaction/verifyFDC", () => {
    it("should get abiEncodedResponse", async () => {
        const payload = {
            abiEncodedRequest: "0x42616c616e636544656372656173696e675472616e73616374696f6e0000000074657374444f4745000000000000000000000000000000000000000000000000314977f8cf673839a2e143386c1ce17f3d88894bd804c66c9803b7ee1c4a4cb4b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74db9d7b0e212d13e3f54f6bd60a9020f6e9b793cd2426c237fbbf10710168626f",
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedResponse without 0x in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "42616c616e636544656372656173696e675472616e73616374696f6e0000000074657374444f4745000000000000000000000000000000000000000000000000314977f8cf673839a2e143386c1ce17f3d88894bd804c66c9803b7ee1c4a4cb4b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74db9d7b0e212d13e3f54f6bd60a9020f6e9b793cd2426c237fbbf10710168626f",
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedResponse with 0X in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "0X42616c616e636544656372656173696e675472616e73616374696f6e0000000074657374444f4745000000000000000000000000000000000000000000000000314977f8cf673839a2e143386c1ce17f3d88894bd804c66c9803b7ee1c4a4cb4b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74db9d7b0e212d13e3f54f6bd60a9020f6e9b793cd2426c237fbbf10710168626f",
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get bad request (400) with wrong payload", async () => {
        const payload = {
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
    it("should get bad request (400) with non hexadecimal character in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "0xp42616c616e636544656372656173696e675472616e73616374696f6e0000000074657374444f4745000000000000000000000000000000000000000000000000314977f8cf673839a2e143386c1ce17f3d88894bd804c66c9803b7ee1c4a4cb4b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74db9d7b0e212d13e3f54f6bd60a9020f6e9b793cd2426c237fbbf10710168626f",
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
});



