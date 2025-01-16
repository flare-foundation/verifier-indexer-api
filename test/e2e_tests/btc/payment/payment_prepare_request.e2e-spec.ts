import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/Payment/prepareRequest', () => {
  it('should get abiEncodedRequest', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get invalid status with out of range inutxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '1',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('INVALID');
  });
  it('should get 400 for negative inUtxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '-1',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '-1',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '1',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('INVALID');
  });
  it('should get bad request (400) for empty transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId: '',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0x783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status for 0X in transactionId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0X783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get bad request (400) for non numerical character in utxo', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: 'a',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: 'a',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'p83c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc060',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc0',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId: '',
        inUtxo: '0',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '',
        utxo: '0',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '',
      },
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) with empty payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with empty requestBody', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {},
    };
    await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get valid status with no 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status with 0X in attestationType', async () => {
    const payload = {
      attestationType:
        '0X5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status with no 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x5061796d656e7400000000000000000000000000000000000000000000000000',
      sourceId:
        '0X7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
        inUtxo: '0',
        utxo: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Payment/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
});
