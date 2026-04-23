import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, getTestFile } from '../helper';

// Nonexistence window [103751341, 103751441]; firstOverflowBlock is 103751442
const ATTEST_TYPE =
  '0x5852505061796d656e744e6f6e6578697374656e636500000000000000000000';
const SOURCE_ID =
  '0x5852500000000000000000000000000000000000000000000000000000000000';
const PROOF_OWNER = '0xb4963a69d061c43fd8b8cbbc848bcabb591edfa6';

const VALID_BODY = {
  minimalBlockNumber: '103751341',
  deadlineBlockNumber: '103751441',
  deadlineTimestamp: '1776929959',
  destinationAddressHash:
    '0xf8161bc46e6631afd52b4cb82356d553c66e1c2e5b491d8d5e32d7f7ac0ecd6f',
  amount: '1000000000000',
  checkFirstMemoData: true,
  firstMemoDataHash:
    '0xeacbf8e5130abc989ed992be6a2000feb169a7ded87dcf7ebb901800ac9adf44',
  checkDestinationTag: false,
  destinationTag: '0',
  proofOwner: PROOF_OWNER,
};

describe(`/XRPPaymentNonexistence/prepareResponse (${getTestFile(__filename)})`, () => {
  baseHooks();

  it('should return VALID with correct response fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPaymentNonexistence/prepareResponse')
      .send({
        attestationType: ATTEST_TYPE,
        sourceId: SOURCE_ID,
        requestBody: VALID_BODY,
      })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(ATTEST_TYPE);
    expect(response.body.response.sourceId).to.be.equal(SOURCE_ID);
    expect(
      response.body.response.responseBody.firstOverflowBlockNumber,
    ).to.be.equal('103751442');
    expect(
      response.body.response.responseBody.firstOverflowBlockTimestamp,
    ).to.be.equal('1776929960');
  });

  it('should return 400 with empty payload', async () => {
    await request(app.getHttpServer())
      .post('/XRPPaymentNonexistence/prepareResponse')
      .send({})
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
