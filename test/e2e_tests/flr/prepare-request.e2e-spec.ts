import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, api_key, getTestFile} from './helper';
import { flrEncodedRequest, flrRequestNoMic, validPayload } from './fixtures';

describe(`EVMTransaction/prepareRequest (${getTestFile(__filename)})`, () => {
  baseHooks();

  it('should return encoded request', async () => {
    const res = await request(app.getHttpServer())
      .post('/EVMTransaction/prepareRequest')
      .set('X-API-KEY', api_key)
      .send(validPayload)
      .expect(200);

    expect(res.body.status).to.eq('VALID');
    expect(res.body.abiEncodedRequest).to.exist;
    expect(res.body.abiEncodedRequest).to.match(/^0x[0-9a-fA-F]+$/);
  });

  it('should return expected encoded request for FLR request', async () => {
    const res = await request(app.getHttpServer())
      .post('/EVMTransaction/prepareRequest')
      .set('X-API-KEY', api_key)
      .send(flrRequestNoMic)
      .expect(200);

    expect(res.body.status).to.eq('VALID');
    expect(res.body.abiEncodedRequest).to.eq(flrEncodedRequest);
  });
});
