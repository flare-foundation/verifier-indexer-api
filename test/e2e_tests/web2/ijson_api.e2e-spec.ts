import { expect } from 'chai';
import { ethers } from 'ethers';
import * as request from 'supertest';
import { app } from './helper';

describe('/JsonApi/prepareResponse', () => {
  it('should get right responseBody', async () => {
    const payload = {
      attestationType:
        '0x494a736f6e417069000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737457454232000000000000000000000000000000000000000000000000',
      messageIntegrityCode:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      requestBody: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        postprocessJq: '.title',
        abi_signature:
          '{"internalType": "string","name": "title","type": "string"}',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/JsonApi/prepareResponse')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    const abiEncodedData =
      '0x' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000012' +
      '64656c65637475732061757420617574656d0000000000000000000000000000';

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal('VALID');
    expect(responseBody.response.responseBody.abi_encoded_data).to.be.equal(
      abiEncodedData,
    );
  });
});

describe('/JsonApi/mic', () => {
  it('should get right responseBody', async () => {
    const payload = {
      attestationType:
        '0x494a736f6e417069000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737457454232000000000000000000000000000000000000000000000000',
      messageIntegrityCode:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      requestBody: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        postprocessJq: '.title',
        abi_signature:
          '{"internalType": "string","name": "title","type": "string"}',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/JsonApi/mic')
      .send(payload)
      .set('X-API-KEY', '12345')
      .expect(200)
      .expect('Content-Type', /json/);

    const attResponse = {
      attestationType:
        '0x494a736f6e417069000000000000000000000000000000000000000000000000',
      sourceId:
        '0x7465737457454232000000000000000000000000000000000000000000000000',
      votingRound: '0',
      lowestUsedTimestamp: '0',
      requestBody: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        postprocessJq: '.title',
        abi_signature:
          '{"internalType": "string","name": "title","type": "string"}',
      },
      responseBody: {
        abi_encoded_data:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001264656c65637475732061757420617574656d0000000000000000000000000000',
      },
    };

    const abiEncoding: unknown = {
      components: [
        {
          internalType: 'bytes32',
          name: 'attestationType',
          type: 'bytes32',
        },
        { internalType: 'bytes32', name: 'sourceId', type: 'bytes32' },
        { internalType: 'uint64', name: 'votingRound', type: 'uint64' },
        {
          internalType: 'uint64',
          name: 'lowestUsedTimestamp',
          type: 'uint64',
        },
        {
          components: [
            {
              internalType: 'string',
              name: 'url',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'postprocessJq',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'abi_signature',
              type: 'string',
            },
          ],
          internalType: 'struct IJsonApi.RequestBody',
          name: 'requestBody',
          type: 'tuple',
        },
        {
          components: [
            {
              internalType: 'bytes',
              name: 'abi_encoded_data',
              type: 'bytes',
            },
          ],
          internalType: 'struct IJsonApi.ResponseBody',
          name: 'responseBody',
          type: 'tuple',
        },
      ],
      internalType: 'struct IJsonApi.Response',
      name: '_response',
      type: 'tuple',
    };

    const abiEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
      [abiEncoding as ethers.ParamType, 'string'],
      [attResponse, 'Flare'],
    );
    const mic = ethers.keccak256(abiEncoded);

    const responseBody = response.body;
    expect(responseBody.status).to.be.equal('VALID');
    expect(responseBody.messageIntegrityCode).to.be.equal(mic);
  });
});
