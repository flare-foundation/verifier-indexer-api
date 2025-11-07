import { expect } from 'chai';
import { ethers } from 'ethers';
import * as request from 'supertest';
import {
  abiEncodedData,
  abiEncoding,
  api_key,
  app,
  attResponse,
} from './helper';
import { AttestationResponseStatus } from '../../../src/verification/response-status';
import { payload, payload2, payload3, payload4 } from './payloads';

describe('/Web2Json/prepareResponse', () => {
  it('Should get right responseBody', async () => {
    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(payload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(AttestationResponseStatus.VALID);
    expect(responseBody.response.responseBody.abiEncodedData).to.be.equal(
      abiEncodedData,
    );
  });

  it('Should get right responseBody 2', async () => {
    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(payload2)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(AttestationResponseStatus.VALID);
  });

  it('Should get right responseBody 3', async () => {
    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(payload3)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(AttestationResponseStatus.VALID);
  });

  it('Should reject - private IP', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        url: 'https://localhost:3000',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_SOURCE_URL,
    );
  });

  it('Should reject - blocked hostname', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        url: 'https://www.google.com',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_SOURCE_URL,
    );
  });

  it('Should reject - invalid url', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        url: 'http://localhost:3000',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_SOURCE_URL,
    );
  });

  it('Should reject - fetch error', async () => {
    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(payload4)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_FETCH_ERROR,
    );
  });

  it('Should reject - invalid jq filter length', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        postProcessJq:
          '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',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_JQ_FILTER,
    );
  });

  it('Should reject - invalid http method', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        httpMethod: 'POST',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_HTTP_METHOD,
    );
  });

  it('Should reject - invalid headers', async () => {
    const malformedPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        headers: '{"Content-Type":"application/json"',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(malformedPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_HEADERS,
    );
  });

  it('Should reject - invalid query params', async () => {
    const malformedPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        queryParams: '{',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(malformedPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_QUERY_PARAMS,
    );
  });

  it('Should reject - invalid body', async () => {
    const malformedPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        body: '{',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(malformedPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_BODY,
    );
  });

  it('Should reject - invalid abi signature', async () => {
    const malformedPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        abiSignature: '{',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(malformedPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_ABI_SIGNATURE,
    );
  });

  it('Should reject - invalid encode error', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        abiSignature:
          '{"components": [{"internalType": "uint8","name": "userId","type": "uint8"},{"internalType": "uint8","name": "id","type": "uint8"},{"internalType": "string","name": "title","type": "string"},{"internalType": "bool","name": "completed","type": "bool"}],"name": "task","type": "tuple"}',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_ENCODE_ERROR,
    );
  });

  it('Should reject - invalid response content type', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        url: 'https://images.dog.ceo/breeds/terrier-dandie/n02096437_1129.jpg',
        queryParams: '',
        body: '',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_RESPONSE_CONTENT_TYPE,
    );
  });

  it('Should reject - encoding failed', async () => {
    const customPayload = {
      ...payload,
      requestBody: {
        ...payload.requestBody,
        abiSignature: 'uint256',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/Web2Json/prepareResponse')
      .send(customPayload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(
      AttestationResponseStatus.INVALID_ENCODE_ERROR,
    );
  });
});

describe('/Web2Json/mic', () => {
  it('Should get right responseBody', async () => {
    const response = await request(app.getHttpServer())
      .post('/Web2Json/mic')
      .send(payload)
      .set('X-API-KEY', api_key)
      .expect(200)
      .expect('Content-Type', /json/);

    const abiEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
      [abiEncoding as ethers.ParamType, 'string'],
      [attResponse, 'Flare'],
    );
    const mic = ethers.keccak256(abiEncoded);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal(AttestationResponseStatus.VALID);
    expect(responseBody.messageIntegrityCode).to.be.equal(mic);
  });
});
