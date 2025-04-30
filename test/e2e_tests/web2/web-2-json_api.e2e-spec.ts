import { expect } from 'chai';
import { ethers } from 'ethers';
import * as request from 'supertest';
import {
  abiEncodedData,
  abiEncoding,
  api_key,
  app,
  attResponse,
  payload,
  payload2,
  payload3,
  payload4,
} from './helper';
import { AttestationResponseStatus } from '../../../src/verification/response-status';

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

  it('Should get right responseBody ', async () => {
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
        queryParams: '{}',
        body: '{}',
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
