import {
  Web2Json_Request,
  Web2Json_Response,
  Web2Json_ResponseBody,
} from '../../dtos/attestation-types/Web2Json.dto';
import { serializeBigInts } from '../../external-libs/utils';
import { VerificationResponse } from '../response-status';
import { AttestationResponseStatus } from '../response-status';
import axios, { AxiosHeaderValue, AxiosResponse } from 'axios';
import {
  DEFAULT_RESPONSE_TYPE,
  ENCODE_TIMEOUT_ERROR_MESSAGE,
  HTTP_METHOD,
  isValidUrl,
  JQ_TIMEOUT_ERROR_MESSAGE,
  MAX_DEPTH_ONE,
  parseJsonExpectingObject,
  parseJsonWithDepthAndKeysValidation,
  runChildProcess,
  validateApplicationJsonContentType,
  validateHttpMethod,
  validateJqFilterLength,
  validateResponseContentData,
  verificationResponse,
} from './utils';
import {
  Web2JsonSecurityConfig,
  Web2JsonSourceConfig,
  Web2JsonValidationError,
} from '../../../src/config/interfaces/web2Json';
import { Logger } from '@nestjs/common';

/**
 * `Web2Json` attestation type verification function
 * @param request attestation request
 * @param securityConfig
 * @param sourceConfig
 * @param userAgent
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyWeb2Json(
  request: Web2Json_Request,
  securityConfig: Web2JsonSecurityConfig,
  sourceConfig: Web2JsonSourceConfig,
  userAgent: string | undefined,
): Promise<VerificationResponse<Web2Json_Response>> {
  try {
    const requestBody = request.requestBody;
    const sourceUrl = requestBody.url;
    // validate url
    const validSourceUrl = await isValidUrl(
      sourceUrl,
      securityConfig.blockHostnames,
      securityConfig.allowedHostnames,
      securityConfig.maxUrlLength,
    );
    // validate HTTP method
    const sourceMethod = requestBody.httpMethod;
    validateHttpMethod(sourceMethod, sourceConfig.allowedMethods);
    // validate headers
    const sourceHeaders = parseJsonWithDepthAndKeysValidation(
      requestBody.headers,
      MAX_DEPTH_ONE,
      securityConfig.maxHeaders,
      AttestationResponseStatus.INVALID_HEADERS,
    );
    // forward user-agent
    if (userAgent) {
      sourceHeaders['User-Agent'] = userAgent;
    }
    // validate query params
    const sourceQueryParams = parseJsonWithDepthAndKeysValidation(
      requestBody.queryParams,
      MAX_DEPTH_ONE,
      securityConfig.maxQueryParams,
      AttestationResponseStatus.INVALID_QUERY_PARAMS,
    );
    // validate body
    const sourceBody = parseJsonWithDepthAndKeysValidation(
      requestBody.body,
      securityConfig.maxBodyJsonDepth,
      securityConfig.maxBodyJsonKeys,
      AttestationResponseStatus.INVALID_BODY,
    );
    // validate jq filter
    const jqScheme = requestBody.postProcessJq;
    validateJqFilterLength(jqScheme, securityConfig.maxJqFilterLength);
    // validate ABI signature
    const abiSign = parseJsonExpectingObject(
      requestBody.abiSignature,
      AttestationResponseStatus.INVALID_ABI_SIGNATURE,
    );
    // fetch data from user defined source
    const sourceResponse = await fetchData(
      validSourceUrl,
      sourceMethod,
      sourceHeaders,
      sourceQueryParams,
      sourceBody,
      securityConfig,
    );
    // validate content-type header
    const contentType: AxiosHeaderValue = sourceResponse.headers[
      'content-type'
    ] as AxiosHeaderValue;
    validateApplicationJsonContentType(contentType);
    // validate returned JSON structure
    const responseJsonData = validateResponseContentData(
      Buffer.from(sourceResponse.data).toString('utf-8'),
    );
    // process the data with jq
    const dataJq = await runJqSeparately(
      responseJsonData,
      jqScheme,
      securityConfig.jqTimeout,
    );
    // encode
    const encodedData = await runEncodeSeparately(
      abiSign,
      dataJq,
      securityConfig.encodeTimeout,
    );
    // final response
    const response = new Web2Json_Response({
      attestationType: request.attestationType,
      sourceId: request.sourceId,
      votingRound: '0',
      lowestUsedTimestamp: '0',
      requestBody: serializeBigInts(requestBody),
      responseBody: new Web2Json_ResponseBody({
        abiEncodedData: encodedData,
      }),
    });
    return {
      status: AttestationResponseStatus.VALID,
      response,
    };
  } catch (error) {
    Logger.error(`${error}`);
    if (error instanceof Web2JsonValidationError) {
      return verificationResponse(error.attestationResponseStatus);
    }
    return verificationResponse(AttestationResponseStatus.UNKNOWN_ERROR);
  }
}

/**
 * @param validSourceUrl
 * @param sourceMethod
 * @param sourceHeaders
 * @param sourceQueryParams
 * @param sourceBody
 * @param securityConfig
 * @returns
 */
export async function fetchData(
  validSourceUrl: string,
  sourceMethod: HTTP_METHOD,
  sourceHeaders: object | undefined,
  sourceQueryParams: object | undefined,
  sourceBody: object | undefined,
  securityConfig: Web2JsonSecurityConfig,
): Promise<AxiosResponse<ArrayBuffer>> {
  try {
    const sourceResponse = await axios({
      url: validSourceUrl,
      method: sourceMethod,
      headers: sourceHeaders,
      params: sourceQueryParams,
      data: sourceBody,
      responseType: DEFAULT_RESPONSE_TYPE,
      maxContentLength: securityConfig.maxResponseSize, // limit response size
      timeout: securityConfig.maxResponseTimeout,
      maxRedirects: securityConfig.maxRedirects, // limit redirects
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return sourceResponse;
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_FETCH_ERROR,
      `Error fetching source response: ${error}`,
    );
  }
}

/**
 * @param jsonData
 * @param jqScheme
 * @param timeoutMs
 * @returns
 */
export async function runJqSeparately(
  jsonData: object | string,
  jqScheme: string,
  timeoutMs: number,
) {
  try {
    const dataJq = await runChildProcess<object>(
      './dist/verification/web-2-json/jq-process.js',
      { jsonData, jqScheme },
      timeoutMs,
      JQ_TIMEOUT_ERROR_MESSAGE,
    );
    return dataJq;
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_PARSE_ERROR,
      `Error while jq parsing: ${error}`,
    );
  }
}

/**
 * @param abiSignature
 * @param jqPostProcessData
 * @param timeoutMs
 * @returns
 */
export async function runEncodeSeparately(
  abiSignature: object,
  jqPostProcessData: object | string,
  timeoutMs: number,
) {
  try {
    const encodedData = await runChildProcess<string>(
      './dist/verification/web-2-json/encode-process.js',
      { abiSignature, jqPostProcessData },
      timeoutMs,
      ENCODE_TIMEOUT_ERROR_MESSAGE,
    );
    return encodedData;
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_ENCODE_ERROR,
      `Error while encoding: ${error}`,
    );
  }
}
