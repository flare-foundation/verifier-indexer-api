import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";


describe("/BalanceDecreasingTransaction/verifyFDC", () => {
    it("should get abiEncodedResponse", async () => {
        const payload = {
            abiEncodedRequest: "0x42616c616e636544656372656173696e675472616e73616374696f6e000000007465737442544300000000000000000000000000000000000000000000000000bdb72aa009fcf753ceda5445fff73be71ee670c94b2fe231da53b50279b9c5d07c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d39369a369fe4442c18e0e18b580628ac2764725efc0ba83e74254591af1b8913c58c",
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
            abiEncodedRequest: "42616c616e636544656372656173696e675472616e73616374696f6e000000007465737442544300000000000000000000000000000000000000000000000000bdb72aa009fcf753ceda5445fff73be71ee670c94b2fe231da53b50279b9c5d07c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d39369a369fe4442c18e0e18b580628ac2764725efc0ba83e74254591af1b8913c58c",
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
            abiEncodedRequest: "0X42616c616e636544656372656173696e675472616e73616374696f6e000000007465737442544300000000000000000000000000000000000000000000000000bdb72aa009fcf753ceda5445fff73be71ee670c94b2fe231da53b50279b9c5d07c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d39369a369fe4442c18e0e18b580628ac2764725efc0ba83e74254591af1b8913c58c",
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
            abiEncodedRequest: "0xp2616c616e636544656372656173696e675472616e73616374696f6e000000007465737442544300000000000000000000000000000000000000000000000000bdb72aa009fcf753ceda5445fff73be71ee670c94b2fe231da53b50279b9c5d07c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d39369a369fe4442c18e0e18b580628ac2764725efc0ba83e74254591af1b8913c58c",
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
});



