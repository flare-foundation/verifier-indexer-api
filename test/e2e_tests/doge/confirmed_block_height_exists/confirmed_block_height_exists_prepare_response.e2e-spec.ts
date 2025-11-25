import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('/ConfirmedBlockHeightExists/prepareResponse', () => {
  baseHooks();
  it('should get status', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732810040',
    );
    expect(response.body.response.requestBody.blockNumber).to.be.equal(
      '6724543',
    );
    expect(response.body.response.requestBody.queryWindow).to.be.equal('1');
    expect(response.body.response.responseBody.blockTimestamp).to.be.equal(
      '1732810040',
    );
    expect(
      response.body.response.responseBody.numberOfConfirmations,
    ).to.be.equal('6');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockNumber,
    ).to.be.equal('6724542');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockTimestamp,
    ).to.be.equal('1732810035');
  });
  it('should get INVALID status if queryWindow is out of range (too big)', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '400',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('INVALID: BLOCK DOES NOT EXIST');
  });
  it('should get VALID status with queryWindow=0', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '0',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732810040',
    );
    expect(response.body.response.requestBody.blockNumber).to.be.equal(
      '6724543',
    );
    expect(response.body.response.requestBody.queryWindow).to.be.equal('0');
    expect(response.body.response.responseBody.blockTimestamp).to.be.equal(
      '1732810040',
    );
    expect(
      response.body.response.responseBody.numberOfConfirmations,
    ).to.be.equal('6');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockNumber,
    ).to.be.equal('6724542');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockTimestamp,
    ).to.be.equal('1732810035');
  });
  it('should get 400 with queryWindow<0', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '-1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with empty requestBody', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {},
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no blockNuber', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no queryWindow', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with wrong format of blockNumber', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543a',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with wrong format of queryWindow', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1a',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with negative blockNumber', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '-1',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get status with 0X in attestationType', async () => {
    const payload = {
      attestationType:
        '0X436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732810040',
    );
    expect(response.body.response.requestBody.blockNumber).to.be.equal(
      '6724543',
    );
    expect(response.body.response.requestBody.queryWindow).to.be.equal('1');
    expect(response.body.response.responseBody.blockTimestamp).to.be.equal(
      '1732810040',
    );
    expect(
      response.body.response.responseBody.numberOfConfirmations,
    ).to.be.equal('6');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockNumber,
    ).to.be.equal('6724542');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockTimestamp,
    ).to.be.equal('1732810035');
  });
  it('should get status with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0X74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
    expect(response.body.response.lowestUsedTimestamp).to.be.equal(
      '1732810040',
    );
    expect(response.body.response.requestBody.blockNumber).to.be.equal(
      '6724543',
    );
    expect(response.body.response.requestBody.queryWindow).to.be.equal('1');
    expect(response.body.response.responseBody.blockTimestamp).to.be.equal(
      '1732810040',
    );
    expect(
      response.body.response.responseBody.numberOfConfirmations,
    ).to.be.equal('6');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockNumber,
    ).to.be.equal('6724542');
    expect(
      response.body.response.responseBody.lowestQueryWindowBlockTimestamp,
    ).to.be.equal('1732810035');
  });
  it('should get status with no 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(response.body.response.votingRound).to.be.equal('0');
  });
  it('should get status with no 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    expect(response.body.response.attestationType).to.be.equal(
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
    );
    expect(response.body.response.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
  });
  it('should get 400 with too long attestationType', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000a',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too short attestationType', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b48656967687445786973747300000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too short sourceId', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f474500000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with too long sourceId', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f47450000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no hexadecimal characters in attestationType', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b48656967687445786973747300000000000y',
      sourceId:
        '0x74657374444f47450000000000000000000000000000000000000000000000000',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get 400 with no hexadecimal characters in sourceId', async () => {
    const payload = {
      attestationType:
        '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000y',
      requestBody: {
        blockNumber: '6724543',
        queryWindow: '1',
      },
    };
    await request(app.getHttpServer())
      .post('/ConfirmedBlockHeightExists/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
});
