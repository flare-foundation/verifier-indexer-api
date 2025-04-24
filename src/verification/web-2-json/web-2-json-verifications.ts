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
  isApplicationJsonContentType,
  isJson,
  isStringArray,
  isValidHttpMethod,
  isValidUrl,
  JQ_TIMEOUT_ERROR_MESSAGE,
  MAX_DEPTH_ONE,
  parseJsonWithDepthAndKeysValidation,
  runChildProcess,
  tryParseJson,
  verificationResponse,
} from './utils';
import {
  Web2JsonSecurityConfig,
  Web2JsonSourceConfig,
} from 'src/config/interfaces/web2Json';
import { Logger } from '@nestjs/common';

/**
 * `Web2Json` attestation type verification function
 * @param request attestation request
 * @returns Verification response: object containing status and attestation response
 * @category Verifiers
 */
export async function verifyWeb2Json(
  request: Web2Json_Request,
  securityConfig: Web2JsonSecurityConfig,
  sourceConfig: Web2JsonSourceConfig,
  userAgent: string | undefined,
): Promise<VerificationResponse<Web2Json_Response>> {
  const requestBody = request.requestBody;
  const sourceUrl = requestBody.url;
  // validate url
  const validSourceUrl = await isValidUrl(
    sourceUrl,
    securityConfig.blockHostnames,
    securityConfig.maxUrlLength,
  );
  if (!validSourceUrl) {
    return verificationResponse(AttestationResponseStatus.INVALID_SOURCE_URL);
  }
  // validate HTTP method
  const sourceMethod = requestBody.httpMethod;
  if (!isValidHttpMethod(sourceMethod, sourceConfig.allowedMethods)) {
    return verificationResponse(AttestationResponseStatus.INVALID_HTTP_METHOD);
  }
  // validate headers
  const sourceHeaders = parseJsonWithDepthAndKeysValidation(
    requestBody.headers,
    MAX_DEPTH_ONE,
    securityConfig.maxHeaders,
  );
  if (!sourceHeaders) {
    return verificationResponse(AttestationResponseStatus.INVALID_HEADERS);
  }
  // forward user-agent
  if (userAgent) {
    sourceHeaders['User-Agent'] = userAgent;
  }
  // validate query params
  const sourceQueryParams = parseJsonWithDepthAndKeysValidation(
    requestBody.queryParams,
    MAX_DEPTH_ONE,
    securityConfig.maxQueryParams,
  );
  if (!sourceQueryParams) {
    return verificationResponse(AttestationResponseStatus.INVALID_QUERY_PARAMS);
  }
  // validate body
  const sourceBody = parseJsonWithDepthAndKeysValidation(
    requestBody.body,
    securityConfig.maxBodyJsonDepth,
    securityConfig.maxBodyJsonKeys,
  );
  if (!sourceBody) {
    return verificationResponse(AttestationResponseStatus.INVALID_BODY);
  }
  // validate jq filter
  const jqScheme = requestBody.postProcessJq;
  if (jqScheme.length > securityConfig.maxJqFilterLength) {
    return verificationResponse(AttestationResponseStatus.INVALID_JQ_FILTER);
  }
  // validate ABI signature
  const abiSign = tryParseJson(requestBody.abiSignature);
  if (!abiSign) {
    return verificationResponse(
      AttestationResponseStatus.INVALID_ABI_SIGNATURE,
    );
  }
  // fetch data from user defined source
  let sourceResponse: AxiosResponse<ArrayBuffer>;
  try {
    sourceResponse = await axios({
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
  const responseJsonData = tryParseJson(
    Buffer.from(sourceResponse.data).toString('utf-8'),
  );
  if (!responseJsonData) {
    return verificationResponse(
      AttestationResponseStatus.INVALID_RESPONSE_JSON,
    );
  }
  // process the data with jq
  let dataJq: object;
  try {
    if (isStringArray(responseJsonData) || isJson(responseJsonData)) {
      dataJq = await runJqSeparately(
        responseJsonData,
        jqScheme,
        securityConfig.jqTimeout,
      );
      if (!dataJq) {
        Logger.error(`Error while jq parsing: no data returned`);
        return verificationResponse(
          AttestationResponseStatus.INVALID_JQ_PARSE_ERROR,
        );
      }
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
  // encode
  let encodedData: string;
  try {
    encodedData = await runEncodeSeparately(
      abiSign,
      dataJq,
      securityConfig.encodeTimeout,
    );
    if (!encodedData) {
      Logger.error(`Error while encoding: no data returned`);
      return verificationResponse(
        AttestationResponseStatus.INVALID_ENCODE_ERROR,
      );
    }
  } catch (error) {
    Logger.error(`Error while encoding: ${error}`);
    return verificationResponse(AttestationResponseStatus.INVALID_ENCODE_ERROR);
  }
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
}

export function runJqSeparately(
  jsonData: object,
  jqScheme: string,
  timeoutMs: number,
) {
  return runChildProcess<object>(
    './dist/verification/web-2-json/jq-process.js',
    { jsonData, jqScheme },
    timeoutMs,
    JQ_TIMEOUT_ERROR_MESSAGE,
  );
}

export function runEncodeSeparately(
  abiSignature: object,
  jqPostProcessData: object | string,
  timeoutMs: number,
) {
  return runChildProcess<string>(
    './dist/verification/web-2-json/encode-process.js',
    { abiSignature, jqPostProcessData },
    timeoutMs,
    ENCODE_TIMEOUT_ERROR_MESSAGE,
  );
}
