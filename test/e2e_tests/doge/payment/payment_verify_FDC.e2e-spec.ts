import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('/Payment/verifyFDC', () => {
  baseHooks();
  it('should get abiEncodedResponse', async () => {
    const payload = {
      abiEncodedRequest:
        '0x5061796d656e740000000000000000000000000000000000000000000000000074657374444f4745000000000000000000000000000000000000000000000000b2ee3a9f05dac648b064aaa025b8daccdae4af243bc1ef699fbcf2fbf5dc5a86b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
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
        '5061796d656e740000000000000000000000000000000000000000000000000074657374444f4745000000000000000000000000000000000000000000000000b2ee3a9f05dac648b064aaa025b8daccdae4af243bc1ef699fbcf2fbf5dc5a86b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
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
        '0X5061796d656e740000000000000000000000000000000000000000000000000074657374444f4745000000000000000000000000000000000000000000000000b2ee3a9f05dac648b064aaa025b8daccdae4af243bc1ef699fbcf2fbf5dc5a86b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
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
        '0xp061796d656e740000000000000000000000000000000000000000000000000074657374444f4745000000000000000000000000000000000000000000000000b2ee3a9f05dac648b064aaa025b8daccdae4af243bc1ef699fbcf2fbf5dc5a86b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    await request(app.getHttpServer())
      .post('/Payment/verifyFDC')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
