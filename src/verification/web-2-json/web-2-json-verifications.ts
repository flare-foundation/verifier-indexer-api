import {
  Web2Json_Request,
  Web2Json_Response,
  Web2Json_ResponseBody,
} from '../../dtos/attestation-types/Web2Json.dto';
import { serializeBigInts } from '../../external-libs/utils';
import {
  AttestationResponseStatus,
  VerificationResponse,
} from '../response-status';
import axios, { AxiosResponse } from 'axios';
import { Web2JsonValidationError } from './utils';
import {
  HTTP_METHOD,
  Web2JsonSecurityConfig,
  Web2JsonSourceConfig,
} from '../../config/interfaces/web2Json';
import * as https from 'https';
import { ProcessPoolService } from './process-pool.service';
import { CheckedUrl } from './validate-url';
import { parseAndValidateResponse } from './validate-response';
import { parseAndValidateRequest } from './validate-request';

const DEFAULT_RESPONSE_TYPE = 'arraybuffer'; // prevent auto-parsing

/**
 * Verifies `Web2Json` attestation type requests:
 * 1. Validates request parameters
 * 2. Performs HTTP request to fetch JSON data
 * 3. Validates fetched JSON data
 * 4. Applies jq filter to the JSON data
 * 5. Encodes the filtered data using provided ABI signature
 *
 * Steps 4 and 5 are handled by a child process pool to avoid blocking the verifier
 * in case of malicious or long-running jq filters or ABI encoding.
 *
 * @category Verifiers
 */
export async function verifyWeb2Json(
  request: Web2Json_Request,
  securityConfig: Web2JsonSecurityConfig,
  sourceConfig: Web2JsonSourceConfig,
  userAgent: string | undefined,
  workerPool: ProcessPoolService,
): Promise<VerificationResponse<Web2Json_Response>> {
  try {
    const parsedRequest = await parseAndValidateRequest(
      request,
      securityConfig,
      sourceConfig,
      userAgent,
    );

    const sourceResponse = await executeRequest(
      parsedRequest.validSourceUrl,
      parsedRequest.sourceMethod,
      parsedRequest.sourceHeaders,
      parsedRequest.sourceQueryParams,
      parsedRequest.sourceBody,
      securityConfig,
    );
    const responseJsonData = parseAndValidateResponse(sourceResponse);

    const encodedData = await workerPool.filterAndEncodeData(
      responseJsonData,
      parsedRequest.jqScheme,
      parsedRequest.abiSign,
    );

    const response = new Web2Json_Response({
      attestationType: request.attestationType,
      sourceId: request.sourceId,
      votingRound: '0',
      lowestUsedTimestamp: '0',
      requestBody: serializeBigInts(request.requestBody),
      responseBody: new Web2Json_ResponseBody({
        abiEncodedData: encodedData,
      }),
    });
    return {
      status: AttestationResponseStatus.VALID,
      response,
    };
  } catch (error) {
    if (error instanceof Web2JsonValidationError) {
      return { status: error.attestationResponseStatus };
    }
    return { status: AttestationResponseStatus.UNKNOWN_ERROR };
  }
}

async function executeRequest(
  validSourceUrl: CheckedUrl,
  sourceMethod: HTTP_METHOD,
  sourceHeaders: object | undefined,
  sourceQueryParams: object | undefined,
  sourceBody: object | undefined,
  securityConfig: Web2JsonSecurityConfig,
): Promise<AxiosResponse<ArrayBuffer>> {
  try {
    // force lookup to resolve into lookup addresses from 'isValidUrl'
    const httpsAgent = new https.Agent({
      lookup: (hostname, options, callback) => {
        callback(null, validSourceUrl.lookUpAddresses);
      },
      servername: validSourceUrl.hostname,
      rejectUnauthorized: true,
      timeout: securityConfig.requestTimeoutMs,
    });

    return await axios({
      url: validSourceUrl.url,
      method: sourceMethod,
      headers: sourceHeaders,
      params: sourceQueryParams,
      data: sourceBody,
      responseType: DEFAULT_RESPONSE_TYPE,
      maxContentLength: securityConfig.maxResponseSize, // limit response size
      timeout: securityConfig.requestTimeoutMs,
      maxRedirects: securityConfig.maxRedirects, // limit redirects
      validateStatus: (status) => status >= 200 && status < 300,
      httpsAgent,
    });
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_FETCH_ERROR,
      `Error fetching source response: ${error}`,
    );
  }
}
