import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('/ConfirmedBlockHeightExists/verifyFDC', () => {
  baseHooks();
  it('should get status', async () => {
    const payload = {
      abiEncodedRequest:
        '0x436f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374444f4745000000000000000000000000000000000000000000000000a34809cf38e53626ca3e0fb3fa2e6b629ee8172ce30a042fe8b7d4d6387efc560000000000000000000000000000000000000000000000000000000000669bbf0000000000000000000000000000000000000000000000000000000000000001',
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
        '436f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374444f4745000000000000000000000000000000000000000000000000a34809cf38e53626ca3e0fb3fa2e6b629ee8172ce30a042fe8b7d4d6387efc560000000000000000000000000000000000000000000000000000000000669bbf0000000000000000000000000000000000000000000000000000000000000001',
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
        '0X436f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374444f4745000000000000000000000000000000000000000000000000a34809cf38e53626ca3e0fb3fa2e6b629ee8172ce30a042fe8b7d4d6387efc560000000000000000000000000000000000000000000000000000000000669bbf0000000000000000000000000000000000000000000000000000000000000001',
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
        '0xp36f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374444f4745000000000000000000000000000000000000000000000000a34809cf38e53626ca3e0fb3fa2e6b629ee8172ce30a042fe8b7d4d6387efc560000000000000000000000000000000000000000000000000000000000669bbf0000000000000000000000000000000000000000000000000000000000000001',
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
