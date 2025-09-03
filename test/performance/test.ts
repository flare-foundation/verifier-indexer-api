import { performance } from 'perf_hooks';
import * as request from 'supertest';
import {
  api_key,
  payload,
} from '../e2e_tests/web2/helper';
import { AttestationResponseStatus } from '../../src/verification/response-status';

const WEB2J_URL = process.env.WEB2J_URL || 'http://localhost:3000/web2j'; // Adjust as needed
const NUM_REQUESTS = 500;

describe('/Web2Json/prepareResponse', () => {
  it('should run performance test', async function () {
    this.timeout(0); // Set timeout to unlimited
    const EXTERNAL_URL = 'http://127.0.0.1:3100/Web2Json/prepareResponse';
    console.log(`Sending ${NUM_REQUESTS} requests to ${EXTERNAL_URL}...`);
    const start = performance.now();

    const requests = Array.from({ length: NUM_REQUESTS }, async (_, i) => {
      try {
        const response = await request(EXTERNAL_URL)
          .post('')
          .send(payload)
          .set('X-API-KEY', api_key)
          .expect(200)
          .expect('Content-Type', /json/);

        const responseBody = response.body;
        const isValid = responseBody.status === AttestationResponseStatus.VALID;
        if (!isValid) {
          console.error(
            `Request ${i + 1} failed with status: ${responseBody.status}`,
          );

        } else {
          console.log("Response", responseBody)
        }
        return { isValid, response };
      } catch (error) {
        return { isValid: false, error };
      }
    });

    console.log(`Awaiting responses for ${NUM_REQUESTS} requests...`);
    const results = await Promise.all(requests);
    const end = performance.now();

    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.length - validCount;

    console.log(
      `\nCompleted ${NUM_REQUESTS} requests in ${(end - start).toFixed(2)} ms`,
    );
    console.log(
      `Average time per request: ${((end - start) / NUM_REQUESTS).toFixed(2)} ms`,
    );
    console.log(`Valid: ${validCount}, Invalid: ${invalidCount}`);
  });
});
