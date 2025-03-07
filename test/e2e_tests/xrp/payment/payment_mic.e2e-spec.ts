import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/Payment/mic', () => {
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
        utxo: '4',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
          'p7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800c',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/mic')
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) for too short transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'a7182f8cac67e7b0e16cca46e2b40abb01565d207d525a6f0a27c057f35f800',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) with wrong payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/Payment/mic')
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
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
      .post('/Payment/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.messageIntegrityCode.length).to.be.equal(66);
  });
  it('should get no native payment', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737458525000000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '14c6e5ba6fb9fefaac1e0853acdff74e0898c1a2d5e9572585d7774fb4ccdd01',
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

    expect(response.body.status).to.be.equal(
      'INVALID: NOT NATIVE PAYMENT TRANSACTION',
    );
  });
});
