import { standardAddressHash } from '@flarenetwork/mcc';
import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/BalanceDecreasingTransaction/prepareRequest', () => {
  it('should get valid status', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);
    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status without 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status with 0X in attestationType', async () => {
    const payload = {
      attestationType:
        '0X42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status without 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0X74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status with 0x in transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0xb93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get valid status with 0X in transactionId', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '0Xb93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
  });
  it('should get invalid status with valid transaction, but not in DB', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '06df61e5209525e08064098e000f26c335ddc484dc21e92f423cc5e8954f429e',
        sourceAddressIndicator: standardAddressHash(
          'mwjk89cuZgPza3DeQXQ2u2LoAK84cTQaSu',
        ),
      },
    };
    const response = await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
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
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '7c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d393',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
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
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74a',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
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
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          'b93aefcbdf102891e81620632e3e3312130d36298569619386f5f40693940b74',
        sourceAddressIndicator: '',
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
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
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId: '',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
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
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        transactionId:
          '7c511c2deeea412ecd77491ed8e6275aacb8c3f9dfc9ce19509781a75f8d393x',
        sourceAddressIndicator: standardAddressHash(
          'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
        ),
      },
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400)
      .expect('Content-Type', /json/);
  });
  it('should get bad request (400) with empty payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with empty requestBody', async () => {
    const payload = {
      attestationType:
        '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {},
    };
    await request(app.getHttpServer())
      .post('/BalanceDecreasingTransaction/prepareRequest')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
