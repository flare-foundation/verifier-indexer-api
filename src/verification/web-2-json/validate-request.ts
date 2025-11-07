import {
  CheckedUrl,
  parseUrl,
  validateHttpMethod,
  validateUrl,
} from './validate-url';
import { Web2Json_Request } from '../../dtos/attestation-types/Web2Json.dto';
import {
  HTTP_METHOD,
  Web2JsonSecurityParams,
  Web2JsonSource,
} from '../../config/interfaces/web2-json';
import { parseJsonWithDepthAndKeysValidation } from './validate-json';
import { AttestationResponseStatus } from '../response-status';
import { validateJqFilter } from './validate-jq';
import { ParamType } from 'ethers';
import { parseAndValidateAbiType } from './validate-abi';
import { Web2JsonValidationError } from './utils';

export interface ParsedRequestBody {
  validSourceUrl: CheckedUrl;
  sourceMethod: HTTP_METHOD;
  sourceHeaders: object;
  sourceQueryParams: object;
  sourceBody: object;
  jqScheme: string;
  abiType: ParamType;
}

const MAX_DEPTH_ONE = 1;

export async function parseAndValidateRequest(
  request: Web2Json_Request,
  securityParams: Web2JsonSecurityParams,
  source: Web2JsonSource,
  userAgent: string,
) {
  const requestBody = request.requestBody;
  let parsedUrl: URL;
  try {
    parsedUrl = parseUrl(requestBody.url, securityParams.maxUrlLength);
  } catch (e) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_SOURCE_URL,
      `Invalid source URL: ${(e as Error).message}`,
    );
  }
  const endpoint = source.endpoints.find((e) => e.host === parsedUrl.hostname);
  if (!endpoint) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_SOURCE_URL,
      'Source URL host not allowed',
    );
  }
  // validate url
  const validSourceUrl = await validateUrl(parsedUrl, endpoint);
  // validate HTTP method
  const sourceMethod = requestBody.httpMethod;
  validateHttpMethod(sourceMethod, endpoint.methods);
  // validate headers
  let sourceHeaders = parseJsonWithDepthAndKeysValidation(
    requestBody.headers,
    MAX_DEPTH_ONE,
    securityParams.maxHeaders,
    AttestationResponseStatus.INVALID_HEADERS,
  );
  // forward user-agent
  if (userAgent) {
    if (!sourceHeaders) {
      // initialize sourceHeaders if it's undefined
      sourceHeaders = {};
    }
    sourceHeaders['User-Agent'] = userAgent;
  }
  // validate query params
  const sourceQueryParams = parseJsonWithDepthAndKeysValidation(
    requestBody.queryParams,
    MAX_DEPTH_ONE,
    securityParams.maxQueryParams,
    AttestationResponseStatus.INVALID_QUERY_PARAMS,
  );
  // validate body
  const sourceBody = parseJsonWithDepthAndKeysValidation(
    requestBody.body,
    securityParams.maxBodyJsonDepth,
    securityParams.maxBodyJsonKeys,
    AttestationResponseStatus.INVALID_BODY,
  );
  // validate jq filter
  const jqScheme = requestBody.postProcessJq;
  validateJqFilter(jqScheme, securityParams.maxJqFilterLength);
  // validate ABI signature
  const abiType = parseAndValidateAbiType(
    requestBody.abiSignature,
    securityParams.maxAbiSignatureLength,
  );
  return <ParsedRequestBody>{
    validSourceUrl,
    sourceMethod,
    sourceHeaders,
    sourceQueryParams,
    sourceBody,
    jqScheme,
    abiType,
  };
}
