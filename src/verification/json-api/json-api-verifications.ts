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
      console.log('encodedData', encodedData);

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
