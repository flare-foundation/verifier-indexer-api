import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, api_key } from './helper';
import { validPayload } from './fixtures';

describe('EVMTransaction/verifyFDC', () => {
  baseHooks();

  it('should verify FDC request', async () => {
    const prepRes = await request(app.getHttpServer())
      .post('/FLR/EVMTransaction/prepareRequest')
      .set('X-API-KEY', api_key)
      .send(validPayload)
      .expect(200);

    const abiEncodedRequest = prepRes.body.abiEncodedRequest;
    expect(abiEncodedRequest).to.exist;

    const res = await request(app.getHttpServer())
      .post('/FLR/EVMTransaction/verifyFDC')
      .set('X-API-KEY', api_key)
      .send({ abiEncodedRequest })
      .expect(200);

    expect(res.body.status).to.eq('VALID');
    expect(res.body.abiEncodedResponse).to.exist;
    expect(res.body.abiEncodedResponse).to.match(/^0x[0-9a-fA-F]+$/);
  });
});
