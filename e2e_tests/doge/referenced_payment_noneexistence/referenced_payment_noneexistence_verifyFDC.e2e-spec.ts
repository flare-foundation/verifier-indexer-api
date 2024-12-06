import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";


describe("/ReferencedPaymentNonexistence/verifyFDC", () => {
    it("should get status", async () => {
        const payload = {
            abiEncodedRequest: "0x5265666572656e6365645061796d656e744e6f6e6578697374656e636500000074657374444f474500000000000000000000000000000000000000000000000085e3085999e5d4cf4cf0f77e6bdedef1af5da6589fa8d9a9b4845a42843a3dbe0000000000000000000000000000000000000000000000000000000000669bb40000000000000000000000000000000000000000000000000000000000669be700000000000000000000000000000000000000000000000000000000674896503067973a9625c03deeedff68dc0398a502ad048372eb858c06b51f8f0311bd3b00000000000000000000000000000000000000000000000000000000004e86c600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a"
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedResponse without 0x in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "5265666572656e6365645061796d656e744e6f6e6578697374656e636500000074657374444f474500000000000000000000000000000000000000000000000085e3085999e5d4cf4cf0f77e6bdedef1af5da6589fa8d9a9b4845a42843a3dbe0000000000000000000000000000000000000000000000000000000000669bb40000000000000000000000000000000000000000000000000000000000669be700000000000000000000000000000000000000000000000000000000674896503067973a9625c03deeedff68dc0398a502ad048372eb858c06b51f8f0311bd3b00000000000000000000000000000000000000000000000000000000004e86c600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a",
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedResponse with 0X in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "0X5265666572656e6365645061796d656e744e6f6e6578697374656e636500000074657374444f474500000000000000000000000000000000000000000000000085e3085999e5d4cf4cf0f77e6bdedef1af5da6589fa8d9a9b4845a42843a3dbe0000000000000000000000000000000000000000000000000000000000669bb40000000000000000000000000000000000000000000000000000000000669be700000000000000000000000000000000000000000000000000000000674896503067973a9625c03deeedff68dc0398a502ad048372eb858c06b51f8f0311bd3b00000000000000000000000000000000000000000000000000000000004e86c600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a",
        }
        const response = await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get bad request (400) with empty payload", async () => {
        const payload = {
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
    it("should get bad request (400) with non hexadecimal character in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "0xq5265666572656e6365645061796d656e744e6f6e6578697374656e636500000074657374444f474500000000000000000000000000000000000000000000000085e3085999e5d4cf4cf0f77e6bdedef1af5da6589fa8d9a9b4845a42843a3dbe0000000000000000000000000000000000000000000000000000000000669bb40000000000000000000000000000000000000000000000000000000000669be700000000000000000000000000000000000000000000000000000000674896503067973a9625c03deeedff68dc0398a502ad048372eb858c06b51f8f0311bd3b00000000000000000000000000000000000000000000000000000000004e86c600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a91052d869037a833d1b074cf02348ee2a6d0f47ef207358d3e04120731d9d6a",
        }
        await request(app.getHttpServer())
            .post("/ReferencedPaymentNonexistence/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
});











