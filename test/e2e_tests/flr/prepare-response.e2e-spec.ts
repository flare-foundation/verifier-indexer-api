import { expect } from 'chai';
import * as request from 'supertest';
import { app, baseHooks, api_key, getTestFile } from './helper';
import { flrEncodedRequest, flrRequestNoMic, validPayload } from './fixtures';
import { AttestationResponseStatus } from '../../../src/verification/response-status';

describe(`EVMTransaction/prepareResponse (${getTestFile(__filename)})`, () => {
  baseHooks();

  const attestationType = validPayload.attestationType;
  const sourceId = validPayload.sourceId;

  const requestWithEventsDisabled = {
    attestationType,
    sourceId,
    requestBody: {
      transactionHash:
        '0xd71d5dd7ebb91ba7bd9d943973e3066666db430e56a34b225279872869fbeaf5',
      requiredConfirmations: '1',
      provideInput: true,
      listEvents: false,
      logIndices: ['0', '1', '2'],
    },
  };

  const requestWithEventsEnabled = {
    attestationType,
    sourceId,
    requestBody: {
      transactionHash:
        '0xc119e71b540950c6e4f73814d34b5e214c3907707354796acca75cd4a84d1439',
      requiredConfirmations: '1',
      provideInput: false,
      listEvents: true,
      logIndices: ['0', '1', '2'],
    },
  };

  const requestDeploy = {
    attestationType,
    sourceId,
    requestBody: {
      transactionHash:
        '0xaf687bd9ddde8a5116e2fd82006816be45ea16d76afafd3bf8ea4f89f2bd5eb8',
      requiredConfirmations: '1',
      provideInput: false,
      listEvents: true,
      logIndices: [],
    },
  };

  const postPrepareResponse = async (
    payload: object,
    expectedStatus = 200,
    apiKey = api_key,
  ) => {
    return request(app.getHttpServer())
      .post('/EVMTransaction/prepareResponse')
      .set('X-API-KEY', apiKey)
      .send(payload)
      .expect(expectedStatus);
  };

  it('should return valid response for correct transaction', async () => {
    const res = await postPrepareResponse(validPayload);

    expect(res.body.status).to.eq('VALID');
    expect(res.body.response.responseBody.sourceAddress).to.eq(
      '0x8a44DC02E250F0f0f388B73a257C53E3BB50321d',
    );
  });

  it('should fail with invalid API key', async () => {
    await postPrepareResponse(validPayload, 401, 'wrong-key');
  });

  it('should fail if transaction does not exist', async () => {
    const invalidPayload = {
      ...validPayload,
      requestBody: {
        ...validPayload.requestBody,
        transactionHash:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      },
    };

    const res = await postPrepareResponse(invalidPayload);

    // Tests might return status != VALID or other error status depending on impl
    expect(res.body.status).to.not.eq('VALID');
  });

  it('should not verify the request with indices and list events false', async () => {
    const res = await postPrepareResponse(requestWithEventsDisabled);
    expect(res.body.status).to.equal(AttestationResponseStatus.INVALID);
  });

  it('should list all events if so specified', async () => {
    const payload = {
      ...requestWithEventsDisabled,
      requestBody: {
        ...requestWithEventsDisabled.requestBody,
        listEvents: true,
        logIndices: [],
      },
    };

    const res = await postPrepareResponse(payload);
    expect(res.body.status).to.equal(AttestationResponseStatus.VALID);
    expect(res.body.response).to.exist;
    expect(res.body.response.responseBody.events.length).to.equal(24);
  });

  it('should not verify if non-existent index', async () => {
    const payload = {
      ...requestWithEventsDisabled,
      requestBody: {
        ...requestWithEventsDisabled.requestBody,
        listEvents: true,
        logIndices: ['50'],
      },
    };

    const res = await postPrepareResponse(payload);
    expect(res.body.status).to.equal(AttestationResponseStatus.INVALID);
  });

  it('should sort events according to logIndices', async () => {
    const payload = {
      ...requestWithEventsDisabled,
      requestBody: {
        ...requestWithEventsDisabled.requestBody,
        listEvents: true,
        logIndices: ['2', '17', '3', '1', '3'],
      },
    };

    const res = await postPrepareResponse(payload);
    expect(res.body.status).to.equal(AttestationResponseStatus.VALID);
    expect(res.body.response.responseBody.events[0].logIndex).to.equal('2');
    expect(res.body.response.responseBody.events[1].logIndex).to.equal('17');
    expect(res.body.response.responseBody.events[4].logIndex).to.equal('3');
  });

  it('should reject verify non-existent transaction', async () => {
    const payload = {
      ...requestWithEventsDisabled,
      requestBody: {
        ...requestWithEventsDisabled.requestBody,
        listEvents: false,
        logIndices: [],
        transactionHash:
          '0xc71d5dd7ebb91ba7bd9d943973e3066666db430e56a34b225279872869fbeaf5',
      },
    };

    const res = await postPrepareResponse(payload);
    expect(res.body.status).to.equal(AttestationResponseStatus.INVALID);
  });

  it('should reject faulty indexes', async () => {
    const res = await postPrepareResponse(requestWithEventsEnabled);
    expect(res.body.status).to.equal(AttestationResponseStatus.INVALID);
  });

  it('should confirm a valid request', async () => {
    const payload = {
      ...requestWithEventsEnabled,
      requestBody: {
        ...requestWithEventsEnabled.requestBody,
        logIndices: ['43', '61'],
      },
    };

    const res = await postPrepareResponse(payload);
    expect(res.body.status).to.equal(AttestationResponseStatus.VALID);
    expect(res.body.response).to.exist;
    expect(res.body.response.responseBody.events.length).to.equal(2);
    expect(res.body.response.responseBody.isDeployment).to.equal(false);
  });

  it('should confirm contract deployment', async () => {
    const res = await postPrepareResponse(requestDeploy);
    expect(res.body.status).to.equal(AttestationResponseStatus.VALID);
    expect(res.body.response).to.exist;
    expect(res.body.response.responseBody.isDeployment).to.equal(true);
  });

  it('should fail with invalid payload (missing field)', async () => {
    const badPayload = {
      attestationType: validPayload.attestationType,
      sourceId: validPayload.sourceId,
      requestBody: {
        // missing transactionHash
        requiredConfirmations: '1',
      },
    };

    await postPrepareResponse(badPayload, 400); // Bad Request from Config/Validation
  });

  it('should verify encoded FLR request', async () => {
    const res = await request(app.getHttpServer())
      .post('/EVMTransaction')
      .set('X-API-KEY', api_key)
      .send({ abiEncodedRequest: flrEncodedRequest })
      .expect(200);

    expect(res.body.status).to.equal('VALID');
    expect(res.body.response).to.exist;
    expect(res.body.response.sourceId).to.equal(flrRequestNoMic.sourceId);
    expect(res.body.response.requestBody.transactionHash).to.equal(
      flrRequestNoMic.requestBody.transactionHash,
    );
  });

  it('should prepare response for FLR request', async () => {
    const res = await request(app.getHttpServer())
      .post('/EVMTransaction/prepareResponse')
      .set('X-API-KEY', api_key)
      .send(flrRequestNoMic)
      .expect(200);

    expect(res.body.status).to.equal('VALID');
    expect(res.body.response).to.exist;
    expect(res.body.response.sourceId).to.equal(flrRequestNoMic.sourceId);
    expect(res.body.response.requestBody.transactionHash).to.equal(
      flrRequestNoMic.requestBody.transactionHash,
    );
  });
});
