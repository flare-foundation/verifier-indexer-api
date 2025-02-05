import { ethers } from 'ethers';
import jq from 'node-jq';
import {
  JsonApi_Request,
  JsonApi_Response,
  JsonApi_ResponseBody,
} from '../../dtos/attestation-types/JsonApi.dto';
import { serializeBigInts } from '../../external-libs/utils';
import {
  AttestationResponseStatus,
  VerificationResponse,
} from './../response-status';

/**
 * `JsonApi` attestation type verification function
 * @param request attestation request
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyJsonApi(
  request: JsonApi_Request,
): Promise<VerificationResponse<JsonApi_Response>> {
  const url = request.requestBody.url;
  const jqScheme = request.requestBody.postprocessJq;
  const abiSign = JSON.parse(request.requestBody.abi_signature) as string[];

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .catch(() => {
      throw new Error('Data availability issue');
    })
    .then((responseData) => {
      return (
        jq as {
          run: (
            scheme: string,
            data: unknown,
            options: { input: string },
          ) => Promise<string>;
        }
      ).run(jqScheme, responseData, {
        input: 'json',
      });
    })
    .then((output: string) => {
      const dataJq: unknown = JSON.parse(output);
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(abiSign, [
        dataJq,
      ]);

      const response = new JsonApi_Response({
        attestationType: request.attestationType,
        sourceId: request.sourceId,
        votingRound: '0',
        lowestUsedTimestamp: '0',
        requestBody: serializeBigInts(request.requestBody),
        responseBody: new JsonApi_ResponseBody({
          abi_encoded_data: encodedData,
        }),
      });

      return {
        status: AttestationResponseStatus.VALID,
        response,
      };
    })
    .catch((error) => {
      if ((error as Error).message === 'Data availability issue') {
        return {
          status: AttestationResponseStatus.INVALID_DATA_AVAILABILITY_ISSUE,
        };
      } else {
        return { status: AttestationResponseStatus.INVALID_JQ_PARSE_ERROR };
      }
    });
}
