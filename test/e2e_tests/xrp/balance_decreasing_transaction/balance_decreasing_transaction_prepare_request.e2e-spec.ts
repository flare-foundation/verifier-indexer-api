import {
    standardAddressHash
} from '@flarenetwork/mcc';
import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";

describe("/BalanceDecreasingTransaction/prepareRequest", () => {
    it("should get valid status", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get valid status without 0x in attestationType", async () => {
        const payload = {
            attestationType: "42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get valid status with 0X in attestationType", async () => {
        const payload = {
            attestationType: "0X42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get valid status without 0x in sourceId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get valid status with 0X in sourceId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0X7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get valid status with 0x in transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get valid status with 0X in transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0X7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "0Xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get invalid status with valid transaction, but not in DB", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "76e45b1e02ad1a4bdf104754b53d4cbbfef8e3a77789c87d99af423d2bea5ab7",
                sourceAddressIndicator: standardAddressHash("rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe")
            }
        }
        const response = await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INVALID');
    });
    it("should get 400 with too short transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too long transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800ca",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no sourceAddressIndicator", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c",
                sourceAddressIndicator: ""
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with not hexadecimal characters in transactionId", async () => {
        const payload = {
            attestationType: "0x42616c616e636544656372656173696e675472616e73616374696f6e00000000",
            sourceId: "0x7465737458525000000000000000000000000000000000000000000000000000",
            requestBody: {
                transactionId: "7c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d393x",
                sourceAddressIndicator: standardAddressHash("rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ")
            }
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get bad request (400) with wrong payload", async () => {
        const payload = {
        }
        await request(app.getHttpServer())
            .post("/BalanceDecreasingTransaction/prepareRequest")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
});









