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

interface BasicAuth {
  basic: { username: string; password: string };
}
interface HeaderAuth {
  header: { key: string; value: string };
}
interface QueryAuth {
  query: { key: string; value: string };
}

// TODO!: Add urls and auth data to the map
const authUrls = new Map<string, BasicAuth | HeaderAuth | QueryAuth>();
// Use the base URL without the trailing .com, .org, or other domain suffixes.
// Examples:
// authUrls.set('https://example', { basic: { username: 'user', password: 'pass' }, });
// authUrls.set('https://example', { header: { key: 'Auth', value: 'Bearer token' }, });
// authUrls.set('https://example', { query: { key: 'key', value: 'token' }, });

/**
 * `JsonApi` attestation type verification function
 * @param request attestation request
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyJsonApi(
  request: IJsonApi_Request,
): Promise<VerificationResponse<IJsonApi_Response>> {
  let url = request.requestBody.url;
  const jqScheme = request.requestBody.postprocessJq;
  const abiSign = JSON.parse(request.requestBody.abi_signature) as object;

  const headers = new Headers();
  const baseUrl = new URL(url).origin;

  if (authUrls.has(baseUrl)) {
    const authData = authUrls.get(baseUrl);

    if ('basic' in authData) {
      headers.set(
        'Authorization',
        'Basic ' +
          btoa(`${authData.basic.username}:${authData.basic.password}`),
      );
    }
    if ('header' in authData) {
      headers.set(authData.header.key, authData.header.value);
    }
    if ('query' in authData) {
      const urlObj = new URL(url);
      urlObj.searchParams.append(authData.query.key, authData.query.value);
      url = urlObj.toString();
    }
  }

  const requestURL = new globalThis.Request(url, {
    method: 'GET',
    headers: headers,
  });

  return fetch(requestURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .catch(() => {
      throw new Error(
        AttestationResponseStatus.INVALID_FETCH_OR_RESPONSE_ERROR,
      );
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
      if (
        error.message ===
        AttestationResponseStatus.INVALID_FETCH_OR_RESPONSE_ERROR.toString()
      ) {
        return {
          status: AttestationResponseStatus.INVALID_FETCH_OR_RESPONSE_ERROR,
        };
      } else {
        return { status: AttestationResponseStatus.INVALID_JQ_PARSE_ERROR };
      }
    });
}
