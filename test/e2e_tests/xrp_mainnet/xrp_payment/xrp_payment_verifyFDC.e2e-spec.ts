import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, getTestFile } from '../helper';

// abiEncodedRequest sourced from Flare mainnet FdcHub AttestationRequest event
const ABI_ENCODED_REQUEST =
  '0x5852505061796d656e740000000000000000000000000000000000000000000058525000000000000000000000000000000000000000000000000000000000009063eac0c79f6daf5c32e286933ab924423b987f28871195e1da4fc50c79bb044a9387277cdaeb96734d42fee23a9401b5949c2d6228ca5a7269e45818bf5f60000000000000000000000000b4963a69d061c43fd8b8cbbc848bcabb591edfa6';

describe(`/XRPPayment/verifyFDC (${getTestFile(__filename)})`, () => {
  baseHooks();

  it('should return VALID for a real mainnet abiEncodedRequest', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPayment/verifyFDC')
      .send({ abiEncodedRequest: ABI_ENCODED_REQUEST })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });

  it('should return VALID without 0x prefix', async () => {
    const response = await request(app.getHttpServer())
      .post('/XRPPayment/verifyFDC')
      .send({ abiEncodedRequest: ABI_ENCODED_REQUEST.slice(2) })
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });

  it('should return 400 with empty payload', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/verifyFDC')
      .send({})
      .set('X-API-KEY', '12345')
      .expect(400);
  });

  it('should return 400 for non-hex abiEncodedRequest', async () => {
    await request(app.getHttpServer())
      .post('/XRPPayment/verifyFDC')
      .send({ abiEncodedRequest: '0xp' + ABI_ENCODED_REQUEST.slice(3) })
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
