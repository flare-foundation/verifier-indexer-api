import { ethers } from 'ethers';
import * as jq from 'node-jq';
import { JsonInput } from 'node-jq/lib/options';
import {
  IJsonApi_Request,
  IJsonApi_Response,
  IJsonApi_ResponseBody,
} from '../../dtos/attestation-types/IJsonApi.dto';
import { serializeBigInts } from '../../external-libs/utils';
import { VerificationResponse } from '../response-status';
import { AttestationResponseStatus } from './../response-status';

interface AuthData {
  basic?: { username: string; password: string };
  header?: { key: string; value: string };
  query?: { key: string; value: string };
}

// TODO!: Add urls and auth data to the map
// Example:
// authUrls.set('https://example.com', { basic: { username: 'user', password: 'pass' } });
const authUrls = new Map<string, AuthData>();

/**
 * `JsonApi` attestation type verification function
 * @param request attestation request
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyJsonApi(
  request: IJsonApi_Request,
): Promise<VerificationResponse<IJsonApi_Response>> {
  const url = request.requestBody.url;
  const jqScheme = request.requestBody.postprocessJq;
  const abiSign = JSON.parse(request.requestBody.abi_signature) as object;

  let requestURL: globalThis.Request;
  const headers = new Headers();

  if (authUrls.has(url)) {
    const authData = authUrls.get(url);

    switch (authData) {
      case authData.basic:
        headers.set(
          'Authorization',
          'Basic ' +
            btoa(`${authData.basic.username}:${authData.basic.password}`),
        );
        requestURL = new globalThis.Request(url, {
          method: 'GET',
          headers,
        });
        break;
      case authData.header:
        headers.set(authData.header.key, authData.header.value);
        requestURL = new globalThis.Request(url, {
          method: 'GET',
          headers,
        });
        break;
      case authData.query:
        requestURL = new globalThis.Request(
          `${url}?${authData.query.key}=${authData.query.value}`,
          {
            method: 'GET',
          },
        );
        break;
      default:
        throw new Error('Invalid auth data');
    }
  } else {
    requestURL = new globalThis.Request(url, {
      method: 'GET',
    });
  }

  return fetch(requestURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .catch(() => {
      throw new Error('Data availability issue');
    })
    .then((data: JsonInput) => {
      return jq.run(jqScheme, data, { input: 'json' });
    })
    .then((filteredData: string) => {
      const dataJq = JSON.parse(filteredData) as JsonInput;
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        [abiSign as ethers.ParamType],
        [dataJq],
      );

      const response = new IJsonApi_Response({
        attestationType: request.attestationType,
        sourceId: request.sourceId,
        votingRound: '0',
        lowestUsedTimestamp: '0',
        requestBody: serializeBigInts(request.requestBody),
        responseBody: new IJsonApi_ResponseBody({
          abi_encoded_data: encodedData,
        }),
      });

      return {
        status: AttestationResponseStatus.VALID,
        response,
      };
    })
    .catch((error: Error) => {
      if (error.message === 'Data availability issue') {
        return {
          status: AttestationResponseStatus.INVALID_DATA_AVAILABILITY_ISSUE,
        };
      } else {
        return { status: AttestationResponseStatus.INVALID_JQ_PARSE_ERROR };
      }
    });
}
