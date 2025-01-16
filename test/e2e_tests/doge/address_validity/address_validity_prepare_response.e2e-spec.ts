import { expect } from 'chai';
import * as request from 'supertest';
import { app } from '../helper';

describe('/AddressValidity/prepareResponse', () => {
  it('should get abiEncodedRequest', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    const resp = response.body.response;
    expect(resp.attestationType).to.be.equal(
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
    );
    expect(resp.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0xd4bea40310baab78c926295e7972dcce8c6309baccab7cbcc11380031177bc1d',
    );
  });
  it('should get abiEncodedRequest long address', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.status).to.be.equal('VALID');
    const resp = response.body.response;
    expect(resp.attestationType).to.be.equal(
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
    );
    expect(resp.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'nZBR99PMzrSPNp8uiToQw9QZpg76SUyeG6',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0xdb9d7b0e212d13e3f54f6bd60a9020f6e9b793cd2426c237fbbf10710168626f',
    );
  });
  it('should get valid request for empty address', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: '',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200);

    expect(response.body.status).to.be.equal('VALID');
    const resp = response.body.response;
    expect(resp.attestationType).to.be.equal(
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
    );
    expect(resp.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal('');
    expect(resp.responseBody.isValid).to.be.equal(false);
    expect(resp.responseBody.standardAddress).to.be.equal('');
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );
  });
  it('should get abiEncodedRequest random address', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr:
          'moh8NxRXLq7vhvAntYi8CZ38sdfksjfweiurfz83fhowef ..sf9swf393+/()(2HbGR2qqcBn',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200);

    expect(response.body.status).to.be.equal('VALID');
    const resp = response.body.response;
    expect(resp.attestationType).to.be.equal(
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
    );
    expect(resp.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38sdfksjfweiurfz83fhowef ..sf9swf393+/()(2HbGR2qqcBn',
    );
    expect(resp.responseBody.isValid).to.be.equal(false);
    expect(resp.responseBody.standardAddress).to.be.equal('');
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );
  });
  it('should get abiEncodedRequest with no 0x in attestationType', async () => {
    const payload = {
      attestationType:
        '4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200);

    expect(response.body.status).to.be.equal('VALID');
  });

  it('should get abiEncodedRequest with 0X in attestationType', async () => {
    const payload = {
      attestationType:
        '0X4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200);

    expect(response.body.status).to.be.equal('VALID');
    const resp = response.body.response;
    expect(resp.attestationType).to.be.equal(
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
    );
    expect(resp.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
  });
  it('should get bad request (400) with too long attestationType', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c696469747900000000000000000000000000000000001',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with too short attestationType', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c6964697479000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with wrong attestationType (but with hexadecimal characters)', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616cA964697479000000000000000000000000000000000',
      sourceId:
        '0x74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get abiEncodedRequest with no 0x in sourceId', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200);

    expect(response.body.status).to.be.equal('VALID');
    const resp = response.body.response;
    expect(resp.attestationType).to.be.equal(
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
    );
    expect(resp.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0xd4bea40310baab78c926295e7972dcce8c6309baccab7cbcc11380031177bc1d',
    );
  });
  it('should get abiEncodedRequest with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0X74657374444f4745000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200);

    expect(response.body.status).to.be.equal('VALID');
    const resp = response.body.response;
    expect(resp.attestationType).to.be.equal(
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
    );
    expect(resp.sourceId).to.be.equal(
      '0x74657374444f4745000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
    );
  });
  it('should get bad request (400) with too long sourceId', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f47450000000000000000000000000000000000000000000000002',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with too short sourceId', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f474500000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with wrong sourceId (but with hexadecimal characters)', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374444f474500000000000000000000000000000000000000000000000a',
      requestBody: {
        addressStr: 'nrbixr2n6yFjLVDa4cqcvuUCTF6qFXf6Cv',
      },
    };
    await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
  it('should get bad request (400) with wrong payload', async () => {
    const payload = {};
    await request(app.getHttpServer())
      .post('/AddressValidity/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(400);
  });
});
