import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, getTestFile } from '../helper';

const TX_ID =
  '4a9387277cdaeb96734d42fee23a9401b5949c2d6228ca5a7269e45818bf5f60';
const PROOF_OWNER = '0xb4963a69d061c43fd8b8cbbc848bcabb591edfa6';
const ATTEST_TYPE =
  '0x5852505061796d656e7400000000000000000000000000000000000000000000';
const SOURCE_ID =
  '0x5852500000000000000000000000000000000000000000000000000000000000';

describe(`/XRPPayment/mic (${getTestFile(__filename)})`, () => {
  baseHooks();

  it('should return VALID with a 66-char MIC', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPayment/mic')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: TX_ID, proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });

  it('should return 400 for empty transactionId', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/mic')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: '', proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 with empty payload', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/mic')
      .send({})
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
