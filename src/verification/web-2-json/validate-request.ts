import { CheckedUrl, validateHttpMethod, validateUrl } from './validate-url';
import { Web2Json_Request } from '../../dtos/attestation-types/Web2Json.dto';
import { HTTP_METHOD, Web2JsonConfig } from '../../config/interfaces/web2-json';
import { parseJsonWithDepthAndKeysValidation } from './validate-json';
import { AttestationResponseStatus } from '../response-status';
import { validateJqFilter } from './validate-jq';
import { ParamType } from 'ethers';
import { parseAndValidateAbiType } from './validate-abi';

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
  config: Web2JsonConfig,
  userAgent: string,
) {
  const requestBody = request.requestBody;
  const sourceUrl = requestBody.url;
  // validate url
  const validSourceUrl = await validateUrl(
    sourceUrl,
    config.sources.flatMap((s) => s.endpoints.map((e) => e.host)),
    config.securityParams.maxUrlLength,
  );
  // validate HTTP method
  const sourceMethod = requestBody.httpMethod;
  validateHttpMethod(sourceMethod, '*');
  // validate headers
  let sourceHeaders = parseJsonWithDepthAndKeysValidation(
    requestBody.headers,
    MAX_DEPTH_ONE,
    config.securityParams.maxHeaders,
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
    config.securityParams.maxQueryParams,
    AttestationResponseStatus.INVALID_QUERY_PARAMS,
  );
  // validate body
  const sourceBody = parseJsonWithDepthAndKeysValidation(
    requestBody.body,
    config.securityParams.maxBodyJsonDepth,
    config.securityParams.maxBodyJsonKeys,
    AttestationResponseStatus.INVALID_BODY,
  );
  // validate jq filter
  const jqScheme = requestBody.postProcessJq;
  validateJqFilter(jqScheme, config.securityParams.maxJqFilterLength);
  // validate ABI signature
  const abiType = parseAndValidateAbiType(
    requestBody.abiSignature,
    config.securityParams.maxAbiSignatureLength,
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
