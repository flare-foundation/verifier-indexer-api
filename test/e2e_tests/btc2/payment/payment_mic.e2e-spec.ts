import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/Payment/mic', () => {
  it('should get abiEncodedRequest', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '5be5e2ab3e3628e8d65d6cf364bc5cef1b844ac7c4acfe8bb3d12f9f1d97a592',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('INVALID: MORE THAN ONE OUTPUT');
  });
});
