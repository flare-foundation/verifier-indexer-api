import { standardAddressHash } from '@flarenetwork/mcc';
import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/BalanceDecreasingTransaction/prepareResponse', () => {
  it('should get valid status', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
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
    const res = response.body.response;
    expect(res.attestationType).to.be.equal(
      '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
    );
    expect(res.sourceId).to.be.equal(
      '0x7465737458525000000000000000000000000000000000000000000000000000',
    );
    expect(res.votingRound).to.be.equal('0');
    expect(res.lowestUsedTimestamp).to.be.equal('2680162100');
    expect(res.requestBody.transactionId).to.be.equal(
      '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
    );
    expect(res.requestBody.sourceAddressIndicator).to.be.equal(
      standardAddressHash('rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ'),
    );
    expect(res.responseBody.blockNumber).to.be.equal('2882442');
    expect(res.responseBody.blockTimestamp).to.be.equal('1733477300');
    expect(res.responseBody.sourceAddressHash).to.be.equal(
      '0x87a56dd79e047e8ec5523d8c7df42cd304b7070656b93554f2a20e055690dfaf',
    );
    expect(res.responseBody.spentAmount).to.be.equal('39960012');
    expect(res.responseBody.standardPaymentReference).to.be.equal(
      '0x46425052664100020000000000000000000000000000000000000000050eab96',
    );
  });
  it('should get valid status without 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
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
    expect(response.body.response.attestationType).to.be.equal(
      '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
    );
  });
  it('should get valid status with 0X in attestationType', async () => {
    const payload = {
      attestationType:
        '0X42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
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
    expect(response.body.response.attestationType).to.be.equal(
      '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
    );
  });
  it('should get valid status without 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
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
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737458525000000000000000000000000000000000000000000000000000',
    );
  });
  it('should get valid status with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0X7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
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
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737458525000000000000000000000000000000000000000000000000000',
    );
  });
  it('should get valid status with 0x in transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
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
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
    );
  });
  it('should get valid status with 0X in transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0X7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0Xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
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
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
    );
  });
  it('should get invalid status with valid transaction, but not in DB', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '06df61e5209525e08064098e000f26c335ddc484dc21e92f423cc5e8954f429e',
        sourceAddressIndicator: standardAddressHash(
          'mwjk89cuZgPza3DeQXQ2u2LoAK84cTQaSu',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('INVALID');
  });
  it('should get 400 with too short transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '7c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d393',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too long transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800ca',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no sourceAddressIndicator', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        sourceAddressIndicator: '',
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId: '',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with not hexadecimal characters in transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '7c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d393x',
        sourceAddressIndicator: standardAddressHash(
          'rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) with wrong payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
