import {
    standardAddressHash
} from '@flarenetwork/mcc';
import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";

describe("/BalanceDecreasingTransaction/prepareResponse", () => {
    it("should get valid status", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        const res = response.body.response
        expect(res.attestationType).to.be.equal('0x42616c616e636544656372656173696e675472616e73616374696f6e00000000');
        expect(res.sourceId).to.be.equal('0x74657374444f4745000000000000000000000000000000000000000000000000');
        expect(res.votingRound).to.be.equal('0');
        expect(res.lowestUsedTimestamp).to.be.equal('1732810005');
        expect(res.requestBody.transactionId).to.be.equal('0xb93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74');
        expect(res.requestBody.sourceAddressIndicator).to.be.equal(standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6"));
        expect(res.responseBody.blockNumber).to.be.equal("6724536");
        expect(res.responseBody.blockTimestamp).to.be.equal("1732810005");
        expect(res.responseBody.sourceAddressHash).to.be.equal("0xdb9d7b0e212d13e3f54f6bd60a9020f6e9b793cd2426c237fbbf10710168626f");
        expect(res.responseBody.spentAmount).to.be.equal("50000000000");
        expect(res.responseBody.standardPaymentReference).to.be.equal("0x46425052664100010000000000000000000000000000000000000000001c1e87");
    });
    it("should get valid status without 0x in attestationType", async () => {
        const payload = {
            attestationType: "42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.response.attestationType).to.be.equal('0x42616c616e636544656372656173696e675472616e73616374696f6e00000000');
    });
    it("should get valid status with 0X in attestationType", async () => {
        const payload = {
            attestationType: "0X42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.response.attestationType).to.be.equal('0x42616c616e636544656372656173696e675472616e73616374696f6e00000000');

    });
    it("should get valid status without 0x in sourceId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.response.sourceId).to.be.equal('0x74657374444f4745000000000000000000000000000000000000000000000000');
    });
    it("should get valid status with 0X in sourceId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0X74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.response.sourceId).to.be.equal('0x74657374444f4745000000000000000000000000000000000000000000000000');
    });
    it("should get valid status with 0x in transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "0xb93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.response.requestBody.transactionId).to.be.equal('0xb93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74');
    });
    it("should get valid status with 0X in transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0X74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "0Xb93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.response.requestBody.transactionId).to.be.equal('0xb93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74');
    });
    it("should get invalid status with valid transaction, but not in DB", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "c7b351b086f3b76d7eb46fe042c6e8484a774618420fa0e7ae36e7237c9961d2",
                sourceAddressIndicator: standardAddressHash("neRSiUUeJr8EB9jKmdG9MPycfFawSy2Nwy")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INVALID');
    });
    it("should get 400 with too short transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b7",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too long transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b741",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no sourceAddressIndicator", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74",
                sourceAddressIndicator: ""
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with not hexadecimal characters in transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x74657374444f4745000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b7y",
                sourceAddressIndicator: standardAddressHash("nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get bad request (400) with wrong payload", async () => {
        const payload = {
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareResponse")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
});









