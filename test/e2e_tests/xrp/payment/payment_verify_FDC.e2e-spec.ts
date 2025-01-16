import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/Payment/verifyFDC', () => {
  it('should get abiEncodedResponse', async () => {
    const payload = {
      abiEncodedRequest:
        '0x5061796d656e74000000000000000000000000000000000000000000000000007465737458525000000000000000000000000000000000000000000000000000370e6b8aa2291acf47cb602b27474f32951879a744728d3fd708dd17073e81fea7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get abiEncodedResponse without 0x in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '5061796d656e74000000000000000000000000000000000000000000000000007465737458525000000000000000000000000000000000000000000000000000370e6b8aa2291acf47cb602b27474f32951879a744728d3fd708dd17073e81fea7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get abiEncodedResponse with 0X in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '0X5061796d656e74000000000000000000000000000000000000000000000000007465737458525000000000000000000000000000000000000000000000000000370e6b8aa2291acf47cb602b27474f32951879a744728d3fd708dd17073e81fea7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get bad request (400) with wrong payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/Payment/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with non hexadecimal character in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '0xp061796d656e74000000000000000000000000000000000000000000000000007465737458525000000000000000000000000000000000000000000000000000370e6b8aa2291acf47cb602b27474f32951879a744728d3fd708dd17073e81fea7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    await request(app.getHttpServer())
      .post('/Payment/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
