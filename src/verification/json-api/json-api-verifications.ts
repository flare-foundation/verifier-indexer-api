import { ethers } from 'ethers';
import * as jq from 'node-jq';
import { Json } from 'node-jq/lib/options';
import {
  IJsonApi_Request,
  IJsonApi_Response,
  IJsonApi_ResponseBody,
} from '../../dtos/attestation-types/IJsonApi.dto';
import { serializeBigInts } from '../../external-libs/utils';
import { VerificationResponse } from '../response-status';
import { AttestationResponseStatus } from './../response-status';
import axios, { AxiosHeaderValue, AxiosResponse } from 'axios';
import {
  isApplicationJsonContentType,
  isJson,
  isStringArray,
  isValidHttpMethod,
  isValidUrl,
  responseType,
  tryParseJSON,
  verificationResponse,
} from './utils';
import {
  IJsonApiSecurityConfig,
  IJsonApiSourceConfig,
} from 'src/config/interfaces/json-api';
import { Logger } from '@nestjs/common';

/**
 * `JsonApi` attestation type verification function
 * @param request attestation request
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyJsonApi(
  request: IJsonApi_Request,
  securityConfig: IJsonApiSecurityConfig,
  sourceConfig: IJsonApiSourceConfig,
  userAgent: string,
): Promise<VerificationResponse<IJsonApi_Response>> {
  const requestBody = request.requestBody;
  const sourceUrl = requestBody.url;
  const isValidSourceUrl = await isValidUrl(
    sourceUrl,
    securityConfig.blockHostnames,
  );
  if (!isValidSourceUrl) {
    return verificationResponse(AttestationResponseStatus.INVALID_SOURCE_URL);
  }
  const sourceMethod = requestBody.http_method;
  if (!isValidHttpMethod(sourceMethod, sourceConfig.allowedMethods)) {
    return verificationResponse(AttestationResponseStatus.INVALID_HTTP_METHOD);
  }
  const sourceHeaders = tryParseJSON(requestBody.headers);
  if (!sourceHeaders) {
    return verificationResponse(AttestationResponseStatus.INVALID_HEADERS);
  }
  // forward user-agent
  sourceHeaders['User-Agent'] = userAgent;

  const sourceQueryParams = tryParseJSON(requestBody.query_params);
  if (!sourceQueryParams) {
    return verificationResponse(AttestationResponseStatus.INVALID_QUERY_PARAMS);
  }
  const sourceBody = tryParseJSON(requestBody.body);
  if (!sourceBody) {
    return verificationResponse(AttestationResponseStatus.INVALID_BODY);
  }
  const jqScheme = requestBody.postprocess_jq;
  const abiSign = tryParseJSON(requestBody.abi_signature);
  if (!abiSign) {
    return verificationResponse(
      AttestationResponseStatus.INVALID_ABI_SIGNATURE,
    );
  }

  // fetch data from user defined source
  let sourceResponse: AxiosResponse<ArrayBuffer>;
  try {
    sourceResponse = await axios({
      url: sourceUrl,
      method: sourceMethod,
      headers: sourceHeaders,
      params: sourceQueryParams,
      data: sourceBody,
      responseType: responseType,
      maxContentLength: sourceConfig.maxResponseSize, // limit response size
      timeout: sourceConfig.maxTimeout,
      maxRedirects: sourceConfig.maxRedirects, // limit redirects
      validateStatus: (status) => status >= 200 && status < 300,
    });
  } catch (error) {
    Logger.error(`Error fetching source response: ${error}`);
    return verificationResponse(AttestationResponseStatus.INVALID_FETCH_ERROR);
  }

  // validate content-type header
  const contentType: AxiosHeaderValue = sourceResponse.headers[
    'content-type'
  ] as AxiosHeaderValue;
  if (!isApplicationJsonContentType(contentType)) {
    return verificationResponse(
      AttestationResponseStatus.INVALID_RESPONSE_CONTENT_TYPE,
    );
  }

  // validate returned JSON structure
  const responseJsonData = tryParseJSON(
    Buffer.from(sourceResponse.data).toString('utf-8'),
  );
  if (!responseJsonData) {
    return verificationResponse(
      AttestationResponseStatus.INVALID_RESPONSE_JSON,
    );
  }

  // process the data with jq
  let dataJq: unknown;
  let filteredData: string;
  try {
    if (isStringArray(responseJsonData)) {
      filteredData = (await jq.run(jqScheme, JSON.stringify(responseJsonData), {
        input: 'string',
        output: 'string',
      })) as string;
      dataJq = JSON.parse(filteredData) as unknown;
    } else if (isJson(responseJsonData)) {
      filteredData = (await jq.run(jqScheme, responseJsonData as Json, {
        input: 'json',
        output: 'string',
      })) as string;
      dataJq = JSON.parse(filteredData) as unknown;
    } else {
      Logger.warn(`Provided JSON is neither stringArray or Json type`);
      return verificationResponse(
        AttestationResponseStatus.INVALID_RESPONSE_JSON,
      );
    }
  } catch (error) {
    Logger.error(`Error while jq parsing: ${error}`);
    return verificationResponse(
      AttestationResponseStatus.INVALID_JQ_PARSE_ERROR,
    );
  }

  let encodedData: string;
  try {
    encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
      [abiSign as ethers.ParamType],
      [dataJq],
    );
  } catch (error) {
    Logger.error(`Error while encoding response: ${error}`);
    return verificationResponse(AttestationResponseStatus.INVALID_ENCODE_ERROR);
  }

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
