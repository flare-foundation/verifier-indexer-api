import { expect } from "chai";
import * as request from "supertest";
import { app } from "../helper";


describe("/AddressValidity/verifyFDC", () => {
    it("should get abiEncodedResponse", async () => {
        const payload = {
            abiEncodedRequest: "0x4164647265737356616c6964697479000000000000000000000000000000000074657374444f47450000000000000000000000000000000000000000000000000d1563f6c78fb59e264f485c8b2d8061131a23d3570710291b9eeab41394e16c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000226e7262697872326e3679466a4c564461346371637675554354463671465866364376000000000000000000000000000000000000000000000000000000000000",
        }
        const response = await request(app.getHttpServer())
            .post("/AddressValidity/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedResponse without 0x in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "4164647265737356616c6964697479000000000000000000000000000000000074657374444f47450000000000000000000000000000000000000000000000000d1563f6c78fb59e264f485c8b2d8061131a23d3570710291b9eeab41394e16c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000226e7262697872326e3679466a4c564461346371637675554354463671465866364376000000000000000000000000000000000000000000000000000000000000",
        }
        const response = await request(app.getHttpServer())
            .post("/AddressValidity/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(200)
            .expect('Content-Type', /json/)

        expect(response.body.status).to.be.equal('VALID');
    });
    it("should get abiEncodedResponse with 0X in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "0X4164647265737356616c6964697479000000000000000000000000000000000074657374444f47450000000000000000000000000000000000000000000000000d1563f6c78fb59e264f485c8b2d8061131a23d3570710291b9eeab41394e16c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000226e7262697872326e3679466a4c564461346371637675554354463671465866364376000000000000000000000000000000000000000000000000000000000000",
        }
        const response = await request(app.getHttpServer())
            .post("/AddressValidity/verifyFDC")
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
            .post("/AddressValidity/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
    it("should get bad request (400) with non hexadecimal character in abiEncodedRequest", async () => {
        const payload = {
            abiEncodedRequest: "0xp164647265737356616c6964697479000000000000000000000000000000000074657374444f47450000000000000000000000000000000000000000000000000d1563f6c78fb59e264f485c8b2d8061131a23d3570710291b9eeab41394e16c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000226e7262697872326e3679466a4c564461346371637675554354463671465866364376000000000000000000000000000000000000000000000000000000000000",
        }
        await request(app.getHttpServer())
            .post("/AddressValidity/verifyFDC")
            .send(payload)
            .set('X-API-KEY', '12345')
            .expect(400)
    });
});









