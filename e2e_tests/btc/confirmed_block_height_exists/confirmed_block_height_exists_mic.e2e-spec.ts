import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";


describe("/ConfirmedBlockHeightExists/mic", () => {
    it("should get status", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get INDETERMINATE status if queryWindow is out of range (too big)", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "2"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('INDETERMINATE');
    });
    it("should get VALID status with queryWindow=0", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "0"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get 400 with queryWindow<0", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "-1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with empty requestBody", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {}
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no blockNuber", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no queryWindow", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no payload", async () => {
        const payload = {}
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with wrong format of blockNumber", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156a",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with wrong format of queryWindow", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1a"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with negative blockNumber", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "-1",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get status with 0X in attestationType", async () => {
        const payload = {
            attestationType: "0X436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get status with 0X in sourceId", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0X7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get status with no 0x in sourceId", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get status with no 0x in attestationType", async () => {
        const payload = {
            attestationType: "436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        const response = await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
        expect(response.body.messageIntegrityCode.length).to.be.equal(66);
    });
    it("should get 400 with too long attestationType", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000a",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too short attestationType", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b48656967687445786973747300000000000",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too short sourceId", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x746573744254430000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with too long sourceId", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x74657374425443000000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no hexadecimal characters in attestationType", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b48656967687445786973747300000000000y",
            sourceId: "0x7465737442544300000000000000000000000000000000000000000000000000",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
    it("should get 400 with no hexadecimal characters in sourceId", async () => {
        const payload = {
            attestationType: "0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000",
            sourceId: "0x746573744254430000000000000000000000000000000000000000000000000y",
            requestBody: {
                blockNumber: "3490156",
                queryWindow: "1"
            }
        }
        await request(app.getHttpServer())
            .post("/ConfirmedBlockHeightExists/mic")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
            .expect('Content-Type', /json/)
    });
});









