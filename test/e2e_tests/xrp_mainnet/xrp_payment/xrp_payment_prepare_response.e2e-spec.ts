import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, getTestFile } from '../helper';

// XRP mainnet transaction at ledger 103751442, timestamp 1776929960
const TX_ID =
  '4a9387277cdaeb96734d42fee23a9401b5949c2d6228ca5a7269e45818bf5f60';
const PROOF_OWNER = '0xb4963a69d061c43fd8b8cbbc848bcabb591edfa6';
const ATTEST_TYPE =
  '0x5852505061796d656e7400000000000000000000000000000000000000000000';
const SOURCE_ID =
  '0x5852500000000000000000000000000000000000000000000000000000000000';

describe(`/XRPPayment/prepareResponse (${getTestFile(__filename)})`, () => {
  baseHooks();

  it('should return VALID with correct response fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPayment/prepareResponse')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: TX_ID, proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(ATTEST_TYPE);
    expect(response.body.response.sourceId).to.be.equal(SOURCE_ID);
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0x' + TX_ID,
    );
    expect(response.body.response.responseBody.blockNumber).to.be.equal(
      '103751442',
    );
    expect(response.body.response.responseBody.blockTimestamp).to.be.equal(
      '1776929960',
    );
    expect(response.body.response.responseBody.status).to.be.equal('0');
  });

  it('should return 400 for empty transactionId', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/prepareResponse')
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
      .post('/XRPPayment/prepareResponse')
      .send({})
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
