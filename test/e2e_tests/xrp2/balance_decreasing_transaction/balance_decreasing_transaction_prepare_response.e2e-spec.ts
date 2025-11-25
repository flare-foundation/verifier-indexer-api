import { standardAddressHash } from '@flarenetwork/mcc';
import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('BalanceDecreasingTransaction: payment reference is zero', () => {
  baseHooks();
  it('Failed escrow create tx', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'C1F0BF9E9864E84B35C32443DB23769F70F15C6D961DC041CCDD9F27B9C1CFEA',
        sourceAddressIndicator: standardAddressHash(
          'rnzDX5EkigqCxyWieLvbbqqZSavpfvuzQB',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(
      response.body.response.responseBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );
  });

  it('Successful escrow create tx', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '848EE47D7A7C526239D87125CF6DE9D0346229F787899B11737213BB87896FD7',
        sourceAddressIndicator: standardAddressHash(
          'rnzDX5EkigqCxyWieLvbbqqZSavpfvuzQB',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(
      response.body.response.responseBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );
  });
});
