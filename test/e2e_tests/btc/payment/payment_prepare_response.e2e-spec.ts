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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0x783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
    );
    expect(response.body.response.requestBody.inUtxo).to.be.equal('0');
    expect(response.body.response.requestBody.utxo).to.be.equal('0');
    expect(response.body.response.responseBody.blockNumber).to.be.equal(
      '3490151',
    );
    expect(response.body.response.responseBody.blockTimestamp).to.be.equal(
      '1732779896',
    );
    expect(response.body.response.responseBody.sourceAddressHash).to.be.equal(
      '0x70d97fd2fc31bde598ce68802b6fa6b65dd7fb0115ac73bbccc2cb5aee00cc0b',
    );
    expect(response.body.response.responseBody.sourceAddressesRoot).to.be.equal(
      '0x7aed58ce7bcdf1cb16a6b904863f46f9bfaf118ccba3e60da4201cc2f7a7d570',
    );
    expect(
      response.body.response.responseBody.receivingAddressHash,
    ).to.be.equal(
      '0x70d97fd2fc31bde598ce68802b6fa6b65dd7fb0115ac73bbccc2cb5aee00cc0b',
    );
    expect(
      response.body.response.responseBody.intendedReceivingAddressHash,
    ).to.be.equal(
      '0x70d97fd2fc31bde598ce68802b6fa6b65dd7fb0115ac73bbccc2cb5aee00cc0b',
    );
    expect(
      response.body.response.responseBody.standardPaymentReference,
    ).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.responseBody.spentAmount).to.be.equal(
      '2736285',
    );
    expect(response.body.response.responseBody.intendedSpentAmount).to.be.equal(
      '2736285',
    );
    expect(response.body.response.responseBody.receivedAmount).to.be.equal(
      '-2736285',
    );
    expect(
      response.body.response.responseBody.intendedReceivedAmount,
    ).to.be.equal('-2736285');
    expect(response.body.response.responseBody.oneToOne).to.be.equal(false);
    expect(response.body.response.responseBody.status).to.be.equal('0');
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
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal(
      'INVALID: INVALID INPUT OR OUTPUT OF THE TRANSACTION',
    );
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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

    expect(response.body.status).to.be.equal('INVALID: NO RECEIVING ADDRESS');
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0x783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
      '0x783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
    );
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
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.requestBody.transactionId).to.be.equal(
      '0x783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
    );
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc060',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
        '7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '783c249c9e84ebb91e350d15403a0d741f530b43361ace8042a736242e68fc06',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
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
      .post('/Payment/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.sourceId).to.be.equal(
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
  });
});
