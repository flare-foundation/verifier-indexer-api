import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/ConfirmedBlockHeightExists/verifyFDC', () => {
  it('should get status', async () => {
    const payload = {
      abiEncodedRequest:
        '0x436f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374585250000000000000000000000000000000000000000000000000006a9030ea3ab0046c68d25546c31cd96c20dd1ad3f1c8ea3bad1be57d352bea3700000000000000000000000000000000000000000000000000000000002bfa8f0000000000000000000000000000000000000000000000000000000000000001',
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
        '436f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374585250000000000000000000000000000000000000000000000000006a9030ea3ab0046c68d25546c31cd96c20dd1ad3f1c8ea3bad1be57d352bea3700000000000000000000000000000000000000000000000000000000002bfa8f0000000000000000000000000000000000000000000000000000000000000001',
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
        '0X436f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374585250000000000000000000000000000000000000000000000000006a9030ea3ab0046c68d25546c31cd96c20dd1ad3f1c8ea3bad1be57d352bea3700000000000000000000000000000000000000000000000000000000002bfa8f0000000000000000000000000000000000000000000000000000000000000001',
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
        '0xp36f6e6669726d6564426c6f636b48656967687445786973747300000000000074657374585250000000000000000000000000000000000000000000000000006a9030ea3ab0046c68d25546c31cd96c20dd1ad3f1c8ea3bad1be57d352bea3700000000000000000000000000000000000000000000000000000000002bfa8f0000000000000000000000000000000000000000000000000000000000000001',
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
