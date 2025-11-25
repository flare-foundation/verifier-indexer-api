import { standardAddressHash } from '@flarenetwork/mcc';
import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('/Payment/prepareResponse', () => {
  baseHooks();
  it('should get abiEncodedRequest', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5061796d656e7400000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737458525000000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '2680162100',
    );
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
    );
    expect(response.body.response.requestBody.inUtxo).to.be.equal('0');
    expect(response.body.response.requestBody.utxo).to.be.equal('0');
    expect(response.body.response.responseBody.blockNumber).to.be.equal(
      '2882442',
    );
    expect(response.body.response.responseBody.blockTimestamp).to.be.equal(
      '1733477300',
    );
    expect(response.body.response.responseBody.sourceAddressHash).to.be.equal(
      standardAddressHash('rnX8aKTwshNqCHQX9AwG5YVC8N7ADnvDaJ'),
    );
    expect(response.body.response.responseBody.sourceAddressesRoot).to.be.equal(
      '0x4fe91421576e4f6e2799d2db04fbf187e856a29bada4de0b10ca4f4591a4d3d0',
    );
    expect(
      response.body.response.responseBody.receivingAddressHash,
    ).to.be.equal(standardAddressHash('rPkCVtwNcAuxmMRhDSTs3VYz9pwEm6TExy'));
    expect(
      response.body.response.responseBody.intendedReceivingAddressHash,
    ).to.be.equal(standardAddressHash('rPkCVtwNcAuxmMRhDSTs3VYz9pwEm6TExy'));
    expect(
      response.body.response.responseBody.standardPaymentReference,
    ).to.be.equal(
      '0x46425052664100020000000000000000000000000000000000000000050eab96',
    );
    expect(response.body.response.responseBody.spentAmount).to.be.equal(
      '39960012',
    );
    expect(response.body.response.responseBody.intendedSpentAmount).to.be.equal(
      '39960012',
    );
    expect(response.body.response.responseBody.receivedAmount).to.be.equal(
      '39960000',
    );
    expect(
      response.body.response.responseBody.intendedReceivedAmount,
    ).to.be.equal('39960000');
    expect(response.body.response.responseBody.oneToOne).to.be.equal(true);
    expect(response.body.response.responseBody.status).to.be.equal('0');
  });
  it('should get invalid status with out of range inutxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '1',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get 400 for negative inUtxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '-1',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 for negative utxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '-1',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get invalid status with out of range utxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '1',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get bad request (400) for empty transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId: '',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for empty inUtxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for empty utxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get valid status for 0x in transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
    );
  });
  it('should get valid status for 0X in transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0Xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0xa7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
    );
  });
  it('should get bad request (400) for non numerical character in utxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: 'a',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for non numerical character in inutxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: 'a',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for non hexadecimal character in transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'p83c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for too long transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c0',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for short long transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc0',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for no transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId: '',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for no inUtxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for no utxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) with wrong payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get valid status with no 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5061796d656e7400000000000000000000000000000000000000000000000000',
    );
  });
  it('should get valid status with 0X in attestationType', async () => {
    const payload = {
      attestationType:
        '0X5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x5061796d656e7400000000000000000000000000000000000000000000000000',
    );
  });
  it('should get valid status with no 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
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
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0X7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737458525000000000000000000000000000000000000000000000000000',
    );
  });
});
