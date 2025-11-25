import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks } from '../helper';

describe('/AddressValidity/prepareResponse', () => {
  baseHooks();
  it('should get abiEncodedRequest', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0xa6c89670eef18acb9c9e0822f035f081d6b41591e737fa639dda59d0a6657102',
    );
  });
  it('should get abiEncodedRequest long address', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr:
          'tb1p9qsz6jcehlk30k0hl9fgujcyx0ym0quehwhcr2jd732far44ylmqhsygmw',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'tb1p9qsz6jcehlk30k0hl9fgujcyx0ym0quehwhcr2jd732far44ylmqhsygmw',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'tb1p9qsz6jcehlk30k0hl9fgujcyx0ym0quehwhcr2jd732far44ylmqhsygmw',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0x5bec008121e438bc0892567f2914ee471b46520b2b04bb65bccb1a115928823c',
    );
  });
  it('should get invalid isValid for empty address', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0xa6c89670eef18acb9c9e0822f035f081d6b41591e737fa639dda59d0a6657102',
    );
  });
  it('should get bad request (400) with too long attestationType', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c696469747900000000000000000000000000000000001',
      sourceId:
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
        '0x7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
        '7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0xa6c89670eef18acb9c9e0822f035f081d6b41591e737fa639dda59d0a6657102',
    );
  });
  it('should get abiEncodedRequest with 0X in sourceId', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0X7465737442544300000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
      '0x7465737442544300000000000000000000000000000000000000000000000000',
    );
    expect(resp.votingRound).to.be.equal('0');
    expect(resp.lowestUsedTimestamp).to.be.equal('0xffffffffffffffff');
    expect(resp.requestBody.addressStr).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.isValid).to.be.equal(true);
    expect(resp.responseBody.standardAddress).to.be.equal(
      'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
    );
    expect(resp.responseBody.standardAddressHash).to.be.equal(
      '0xa6c89670eef18acb9c9e0822f035f081d6b41591e737fa639dda59d0a6657102',
    );
  });
  it('should get bad request (400) with too long sourceId', async () => {
    const payload = {
      attestationType:
        '0x4164647265737356616c69646974790000000000000000000000000000000000',
      sourceId:
        '0x74657374425443000000000000000000000000000000000000000000000000002',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
        '0x746573744254430000000000000000000000000000000000000000000000000',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
        '0x746573744254430000000000000000000000000000000000000000000000000a',
      requestBody: {
        addressStr: 'moh8NxRXLq7vhvAntYi8CZ38HbGR2qqcBn',
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
