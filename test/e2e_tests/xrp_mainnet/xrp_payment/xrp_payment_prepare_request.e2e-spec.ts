import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, getTestFile } from '../helper';

// XRP mainnet transaction at ledger 103751442
const TX_ID =
  '4a9387277cdaeb96734d42fee23a9401b5949c2d6228ca5a7269e45818bf5f60';
const PROOF_OWNER = '0xb4963a69d061c43fd8b8cbbc848bcabb591edfa6';
const ATTEST_TYPE =
  '0x5852505061796d656e7400000000000000000000000000000000000000000000';
const SOURCE_ID =
  '0x5852500000000000000000000000000000000000000000000000000000000000';

describe(`/XRPPayment/prepareRequest (${getTestFile(__filename)})`, () => {
  baseHooks();

  it('should return VALID for a known mainnet XRPPayment transaction', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: TX_ID, proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });

  it('should return VALID with 0x prefix on transactionId', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: '0x' + TX_ID, proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });

  it('should return 400 for empty transactionId', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: '', proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 for too short transactionId', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: TX_ID.slice(0, -1), proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 for too long transactionId', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: TX_ID + '0', proofOwner: PROOF_OWNER },
      })
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 for non-hex transactionId', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: {
          transactionId: 'p' + TX_ID.slice(1),
          proofOwner: PROOF_OWNER,
        },
      })
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 for invalid proofOwner address', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: { transactionId: TX_ID, proofOwner: 'not-an-address' },
      })
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 with empty payload', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/prepareRequest')
      .send({})
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
