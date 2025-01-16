import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/ConfirmedBlockHeightExists/verifyFDC', () => {
  it('should get status', async () => {
    const payload = {
      abiEncodedRequest:
        '0x436f6e6669726d6564426c6f636b4865696768744578697374730000000000007465737442544300000000000000000000000000000000000000000000000000278ad8cc684365d1f1b0ac2e4d893ef2d604cd76f6dacdf96d13f7f37984b2a5000000000000000000000000000000000000000000000000000000000035416c0000000000000000000000000000000000000000000000000000000000000001',
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get abiEncodedResponse without 0x in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '436f6e6669726d6564426c6f636b4865696768744578697374730000000000007465737442544300000000000000000000000000000000000000000000000000278ad8cc684365d1f1b0ac2e4d893ef2d604cd76f6dacdf96d13f7f37984b2a5000000000000000000000000000000000000000000000000000000000035416c0000000000000000000000000000000000000000000000000000000000000001',
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get abiEncodedResponse with 0X in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '0X436f6e6669726d6564426c6f636b4865696768744578697374730000000000007465737442544300000000000000000000000000000000000000000000000000278ad8cc684365d1f1b0ac2e4d893ef2d604cd76f6dacdf96d13f7f37984b2a5000000000000000000000000000000000000000000000000000000000035416c0000000000000000000000000000000000000000000000000000000000000001',
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get bad request (400) with empty payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with non hexadecimal character in abiEncodedRequest', async () => {
    const payload = {
      abiEncodedRequest:
        '0xp36f6e6669726d6564426c6f636b4865696768744578697374730000000000007465737442544300000000000000000000000000000000000000000000000000278ad8cc684365d1f1b0ac2e4d893ef2d604cd76f6dacdf96d13f7f37984b2a5000000000000000000000000000000000000000000000000000000000035416c0000000000000000000000000000000000000000000000000000000000000001',
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
