import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, api_key } from './helper';
import {
  flrMainnetExpectedMic,
  flrRequestNoMic,
  validPayload,
} from './fixtures';

describe('EVMTransaction/mic', () => {
  baseHooks();

  it('should return MIC', async () => {
    const res = await request(app.getHttpServer())
      .post('/FLR/EVMTransaction/mic')
      .set('X-API-KEY', api_key)
      .send(validPayload)
      .expect(200);

    expect(res.body.messageIntegrityCode).to.exist;
    expect(res.body.status).to.eq('VALID');
    expect(res.body.messageIntegrityCode).to.match(/^0x[0-9a-fA-F]{64}$/);
  });

  it('should return expected MIC for FLR request', async () => {
    const res = await request(app.getHttpServer())
      .post('/FLR/EVMTransaction/mic')
      .set('X-API-KEY', api_key)
      .send(flrRequestNoMic)
      .expect(200);

    expect(res.body.status).to.eq('VALID');
    expect(res.body.messageIntegrityCode).to.eq(flrMainnetExpectedMic);
  });
});
