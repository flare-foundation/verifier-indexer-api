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
import axios, { AxiosResponse } from 'axios';
import { isValidUrl, verificationResponse } from './utils';

/**
 * `JsonApi` attestation type verification function
 * @param request attestation request
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyJsonApi(
  request: IJsonApi_Request,
): Promise<VerificationResponse<IJsonApi_Response>> {

  const requestBody = request.requestBody;
  const sourceUrl = requestBody.url;
  const sourceMethod = requestBody.http_method;
  const sourceHeaders = requestBody.headers ? JSON.parse(requestBody.headers) : {};
  const sourceQueryParams = requestBody.query_params ? JSON.parse(requestBody.query_params) : {};
  const sourceBody =  requestBody.body ? JSON.parse(requestBody.body) : {};
  const jqScheme = requestBody.postprocess_jq;
  const abiSign = JSON.parse(requestBody.abi_signature);

  // TODO validate all inputs
  const isValidSourceUrl = isValidUrl(sourceUrl);
  console.log("isValidSourceUrl", isValidSourceUrl)
  if (!isValidSourceUrl) {
    return verificationResponse(AttestationResponseStatus.INVALID_SOURCE_URL);
  }

  // Fetch data from user defined source
  const sourceResponse: AxiosResponse<ArrayBuffer> = await axios({ // TODO catch any fetch error
    url: sourceUrl,
    method: sourceMethod,
    headers: sourceHeaders,
    params: sourceQueryParams,
    data: sourceBody,
    responseType: "arraybuffer", // prevent auto-parsing
    maxContentLength: 1024 * 1024, // limit response to 1MB
    timeout: 1000, // 1s
    maxRedirects: 0, // block redirects
    validateStatus: (status) => status >= 200 && status < 300
  });
  
  // validate Content-Type Header
  const contentType = sourceResponse.headers["content-type"];
  if (!contentType || !contentType.includes("application/json")) {
    return verificationResponse(AttestationResponseStatus.INVALID_RESPONSE_CONTENT_TYPE);
  }

  const responseDataStr = Buffer.from(sourceResponse.data).toString("utf-8");
  // validate JSON structure
  let responseJsonData;
  try {
    responseJsonData = JSON.parse(responseDataStr);
  } catch {
    return verificationResponse(AttestationResponseStatus.INVALID_RESPONSE_JSON);
  }

  const filteredData = await jq.run(jqScheme, responseJsonData, { input: 'json' }) as string; // TODO: as string + catch jq run error
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
    requestBody: serializeBigInts(requestBody),
    responseBody: new IJsonApi_ResponseBody({
      abi_encoded_data: encodedData,
    }),
  });

  return {
    status: AttestationResponseStatus.VALID,
    response,
  };
}
