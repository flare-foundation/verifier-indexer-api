import { CheckedUrl, validateHttpMethod, validateUrl } from './validate-url';
import { Web2Json_Request } from '../../dtos/attestation-types/Web2Json.dto';
import {
  HTTP_METHOD,
  Web2JsonSecurityConfig,
  Web2JsonSourceConfig,
} from '../../config/interfaces/web2Json';
import {
  parseJsonExpectingObject,
  parseJsonWithDepthAndKeysValidation,
} from './validate-json';
import { AttestationResponseStatus } from '../response-status';
import { validateJqFilter } from './validate-jq';

export interface ParsedRequestBody {
  validSourceUrl: CheckedUrl;
  sourceMethod: HTTP_METHOD;
  sourceHeaders: object;
  sourceQueryParams: object;
  sourceBody: object;
  jqScheme: string;
  abiSign: object;
}

const MAX_DEPTH_ONE = 1;

export async function parseAndValidateRequest(
  request: Web2Json_Request,
  securityConfig: Web2JsonSecurityConfig,
  sourceConfig: Web2JsonSourceConfig,
  userAgent: string,
) {
  const requestBody = request.requestBody;
  const sourceUrl = requestBody.url;
  // validate url
  const validSourceUrl = await validateUrl(
    sourceUrl,
    securityConfig.blockHostnames,
    securityConfig.allowedHostnames,
    securityConfig.maxUrlLength,
  );
  // validate HTTP method
  const sourceMethod = requestBody.httpMethod;
  validateHttpMethod(sourceMethod, sourceConfig.allowedMethods);
  // validate headers
  let sourceHeaders = parseJsonWithDepthAndKeysValidation(
    requestBody.headers,
    MAX_DEPTH_ONE,
    securityConfig.maxHeaders,
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
  validateJqFilter(jqScheme, securityConfig.maxJqFilterLength);
  // validate ABI signature
  const abiSign = parseJsonExpectingObject(
    requestBody.abiSignature,
    AttestationResponseStatus.INVALID_ABI_SIGNATURE,
  );
  return <ParsedRequestBody>{
    validSourceUrl,
    sourceMethod,
    sourceHeaders,
    sourceQueryParams,
    sourceBody,
    jqScheme,
    abiSign,
  };
}
