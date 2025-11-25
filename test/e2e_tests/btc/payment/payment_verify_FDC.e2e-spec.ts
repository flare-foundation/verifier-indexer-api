import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('/Payment/verifyFDC', () => {
  baseHooks();
  it('should get abiEncodedResponse', async () => {
    const payload = {
      abiEncodedRequest:
        '0x5061796d656e740000000000000000000000000000000000000000000000000074657374425443000000000000000000000000000000000000000000000000002c3a0bc2e936f5d5f1102f2983aeac9fa6434bb4d9e744e776263f97f29f777e783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc0600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
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
        '5061796d656e740000000000000000000000000000000000000000000000000074657374425443000000000000000000000000000000000000000000000000002c3a0bc2e936f5d5f1102f2983aeac9fa6434bb4d9e744e776263f97f29f777e783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc0600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
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
        '0X5061796d656e740000000000000000000000000000000000000000000000000074657374425443000000000000000000000000000000000000000000000000002c3a0bc2e936f5d5f1102f2983aeac9fa6434bb4d9e744e776263f97f29f777e783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc0600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
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
        '0xp5061796d656e740000000000000000000000000000000000000000000000000074657374425443000000000000000000000000000000000000000000000000002c3a0bc2e936f5d5f1102f2983aeac9fa6434bb4d9e744e776263f97f29f777e783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc0600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    await request(app.getHttpServer())
      .post('/Payment/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
