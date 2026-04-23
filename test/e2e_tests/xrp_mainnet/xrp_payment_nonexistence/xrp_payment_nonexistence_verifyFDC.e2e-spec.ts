import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, getTestFile } from '../helper';

// abiEncodedRequest sourced from Flare mainnet FdcHub AttestationRequest event
const ABI_ENCODED_REQUEST =
  '0x5852505061796d656e744e6f6e6578697374656e6365000000000000000000005852500000000000000000000000000000000000000000000000000000000000078ffa755778226865f35e0fcb8666390f49ef3aba4ffc1711d4ca29e7b3420900000000000000000000000000000000000000000000000000000000062f1ead00000000000000000000000000000000000000000000000000000000062f1f110000000000000000000000000000000000000000000000000000000069e9cca7f8161bc46e6631afd52b4cb82356d553c66e1c2e5b491d8d5e32d7f7ac0ecd6f000000000000000000000000000000000000000000000000000000e8d4a510000000000000000000000000000000000000000000000000000000000000000001eacbf8e5130abc989ed992be6a2000feb169a7ded87dcf7ebb901800ac9adf4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4963a69d061c43fd8b8cbbc848bcabb591edfa6';

describe(`/XRPPaymentNonexistence/verifyFDC (${getTestFile(__filename)})`, () => {
  baseHooks();

  it('should return VALID for a real mainnet abiEncodedRequest', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPaymentNonexistence/verifyFDC')
      .send({ abiEncodedRequest: ABI_ENCODED_REQUEST })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });

  it('should return VALID without 0x prefix', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPaymentNonexistence/verifyFDC')
      .send({ abiEncodedRequest: ABI_ENCODED_REQUEST.slice(2) })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });

  it('should return 400 with empty payload', async () => {
    await request(app.getHttpServer())
      .post('/XRPPaymentNonexistence/verifyFDC')
      .send({})
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 for non-hex abiEncodedRequest', async () => {
    await request(app.getHttpServer())
      .post('/XRPPaymentNonexistence/verifyFDC')
      .send({ abiEncodedRequest: '0xp' + ABI_ENCODED_REQUEST.slice(3) })
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
