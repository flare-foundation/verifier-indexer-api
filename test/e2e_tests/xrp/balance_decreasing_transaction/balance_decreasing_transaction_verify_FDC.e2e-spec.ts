import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('/BalanceDecreasingTransaction/verifyFDC', () => {
  baseHooks();
  it('should get abiEncodedResponse', async () => {
    const payload = {
      abiEncodedRequest:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000746573745852500000000000000000000000000000000000000000000000000040baaf7ba0a3584caad562b1591625935fb485da703d79f9b64d69a767df908fa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c87a56dd79e047e8ec5523d8c7df42cd304b7070656b93554f2a20e055690dfaf',
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get abiEncodedResponse without 0x in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '42616c616e636544656372656173696e675472616e73616374696f6e00000000746573745852500000000000000000000000000000000000000000000000000040baaf7ba0a3584caad562b1591625935fb485da703d79f9b64d69a767df908fa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c87a56dd79e047e8ec5523d8c7df42cd304b7070656b93554f2a20e055690dfaf',
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get abiEncodedResponse with 0X in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '0X42616c616e636544656372656173696e675472616e73616374696f6e00000000746573745852500000000000000000000000000000000000000000000000000040baaf7ba0a3584caad562b1591625935fb485da703d79f9b64d69a767df908fa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c87a56dd79e047e8ec5523d8c7df42cd304b7070656b93554f2a20e055690dfaf',
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get bad request (400) with wrong payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with non hexadecimal character in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '0xp2616c616e636544656372656173696e675472616e73616374696f6e00000000746573745852500000000000000000000000000000000000000000000000000040baaf7ba0a3584caad562b1591625935fb485da703d79f9b64d69a767df908fa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c87a56dd79e047e8ec5523d8c7df42cd304b7070656b93554f2a20e055690dfaf',
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
