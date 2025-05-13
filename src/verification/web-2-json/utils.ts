import {
  AllowedMethods,
  EncodeMessage,
  PrivateIPError,
  JqMessage,
  ProcessErrorMessage,
  ProcessMessage,
  ProcessResultMessage,
  Web2JsonValidationError,
} from '../../config/interfaces/web2Json';
import {
  AttestationResponseStatus,
  VerificationResponse,
} from '../response-status';
import * as dns from 'dns';
import { AxiosHeaderValue } from 'axios';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { fork } from 'child_process';

export const DEFAULT_RESPONSE_TYPE = 'arraybuffer'; // prevent auto-parsing
export const RESPONSE_CONTENT_TYPE_JSON = 'application/json';
export const MAX_DEPTH_ONE = 1;
export const JQ_TIMEOUT_ERROR_MESSAGE = 'jq process exceeded timeout';
export const ENCODE_TIMEOUT_ERROR_MESSAGE = 'Encode process exceeded timeout';

/**
 * HTTP method enums
 */
export enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

// list of private IP address patterns to check against
const ipPrivate = [
  /^127\./, // 127.0.0.0 – 127.255.255.255 loopback
  /^0\.0\.0\.0$/,
  /^169\.254\./, // 169.254.0.0 – 169.254.255.255 link-local
  /^192\.168\./, // 192.168.0.0 – 192.168.255.255
  /^10\./, // 10.0.0.0 – 10.255.255.255
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0 – 172.31.255.255
  /^::1$/, // loopback
  /^fc00:/,
  /^fd00:/,
  /^fe80:/, // link-local
];

/**
 * Validates input URL against allowed protocols, hostnames, and length.
 * Also performs DNS resolution and checks for private IP addresses.
 *
 * @param inputUrl
 * @param blockedHostnames
 * @param allowedHostnames
 * @param allowedUrlLength
 * @returns Validated URL or throws an error
 */
export async function isValidUrl(
  inputUrl: string,
  blockedHostnames: string[],
  allowedHostnames: string[],
  allowedUrlLength: number,
): Promise<string> {
  try {
    // check URL length before and after sanitization
    if (inputUrl.length > allowedUrlLength) {
      throw new Error(`URL too long before sanitization: ${inputUrl.length}`);
    }
    const sanitizedInputUrl = sanitizeUrl(inputUrl);
    if (sanitizedInputUrl.length > allowedUrlLength) {
      throw new Error(
        `URL too long after sanitization: ${sanitizedInputUrl.length}`,
      );
    }
    const parsedUrl = new URL(sanitizedInputUrl);
    // only https is allowed
    if (parsedUrl.protocol !== 'https:') {
      throw new Error(`Invalid protocol: ${parsedUrl.protocol}`);
    }
    const normalizedHostname = parsedUrl.hostname.toLowerCase();
    // check if hostname is blocked
    if (
      blockedHostnames.some(
        (blocked) =>
          normalizedHostname === blocked ||
          normalizedHostname.endsWith(`.${blocked}`),
      )
    ) {
      throw new Error(`Blocked hostname: ${parsedUrl.hostname}`);
    }
    // ensure hostname is allowed
    if (
      allowedHostnames.length > 0 &&
      !allowedHostnames.some(
        (allowed) =>
          normalizedHostname === allowed ||
          normalizedHostname.endsWith(`.${allowed}`),
      )
    ) {
      throw new Error(`Hostname not in allowed list: ${parsedUrl.hostname}`);
    }
    // perform DNS resolution and check for private IP addresses
    try {
      const addresses = await dns.promises.lookup(parsedUrl.hostname, {
        all: true,
      });
      for (const { address } of addresses) {
        // check if IP is private
        if (ipPrivate.some((regex) => regex.test(address))) {
          throw new PrivateIPError(
            `Blocked IP: ${address} from ${parsedUrl.hostname}`,
          );
        }
      }
    } catch (error) {
      if (error instanceof PrivateIPError) {
        throw error;
      }
      throw new Error(
        `DNS resolution failed for ${parsedUrl.hostname}: ${error}`,
      );
    }
    const checkedUrl =
      parsedUrl.protocol + '//' + parsedUrl.hostname + parsedUrl.pathname;
    return checkedUrl;
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_SOURCE_URL,
      `Error while validating URL: ${error}`,
    );
  }
}

/**
 * Creates a standardized response for verification.
 *
 * @param status
 * @param response
 * @returns
 */
export function verificationResponse<T>(
  status: AttestationResponseStatus,
  response?: T,
): VerificationResponse<T> {
  return {
    status,
    response,
  };
}

/**
 * Parses JSON input and expects it to be an object. Throws an error if not.
 *
 * @param input
 * @param errorStatus
 * @returns
 */
export function parseJsonExpectingObject(
  input: string,
  errorStatus: AttestationResponseStatus,
): object {
  try {
    const parsed = JSON.parse(input) as unknown;
    if (parsed !== null && typeof parsed === 'object') {
      return parsed;
    }
    throw new Error('Parsed value is not an object');
  } catch (error) {
    throw new Web2JsonValidationError(errorStatus, `Invalid JSON: ${error}`);
  }
}

/**
 * @param input
 * @returns
 */
export function validateResponseContentData(input: string): object | string {
  try {
    const parsed = JSON.parse(input) as unknown;
    // jq-wasm accepts objects or strings
    if (typeof parsed === 'object' || typeof parsed === 'string') {
      return parsed;
    }
    throw new Error('Provided JSON is neither stringArray or Json type');
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_RESPONSE_JSON,
      `Invalid JSON: ${error}`,
    );
  }
}

/**
 * @param httpMethod
 * @param allowedHttpMethods
 * @returns
 */
export function validateHttpMethod(
  httpMethod: HTTP_METHOD,
  allowedHttpMethods: AllowedMethods,
): void {
  if (allowedHttpMethods === '*' || allowedHttpMethods.includes(httpMethod)) {
    return;
  }
  throw new Web2JsonValidationError(
    AttestationResponseStatus.INVALID_HTTP_METHOD,
    httpMethod,
  );
}

/**
 * @param jqFilter
 * @param maxLength
 * @returns
 */
export function validateJqFilterLength(
  jqFilter: string,
  maxLength: number,
): void {
  if (jqFilter.length > maxLength) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_JQ_FILTER,
      `Invalid jq filter: exceeds max allowed length ${jqFilter.length} > ${maxLength}`,
    );
  }
}

/**
 * @param data
 * @returns
 */
export function isStringArray(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((item) => typeof item === 'string');
}

/**
 * @param contentType
 * @returns
 */
export function validateApplicationJsonContentType(
  contentType: AxiosHeaderValue,
): void {
  if (
    typeof contentType === 'string' &&
    contentType.includes(RESPONSE_CONTENT_TYPE_JSON)
  ) {
    return;
  }
  if (Array.isArray(contentType)) {
    if (contentType.some((type) => type.includes(RESPONSE_CONTENT_TYPE_JSON))) {
      return;
    }
  }
  throw new Web2JsonValidationError(
    AttestationResponseStatus.INVALID_RESPONSE_CONTENT_TYPE,
    `Invalid response content type`,
  );
}

/**
 * Validates the depth and the number of keys in a JSON object.
 *
 * @param input
 * @param maxDepthAllowed
 * @param maxKeysAllowed
 * @param depth
 * @param totalKeys
 * @param maxDepth
 * @returns
 */
export function checkJsonDepthAndKeys(
  input: unknown,
  maxDepthAllowed: number,
  maxKeysAllowed: number,
  depth: number = 0,
  totalKeys: number = 0,
  maxDepth: number = 0,
): {
  isValid: boolean;
  maxDepth: number;
  totalKeys: number;
  errorMessage?: string;
} {
  if (depth > maxDepth) {
    maxDepth = depth;
  }
  if (depth > maxDepthAllowed) {
    return {
      isValid: false,
      maxDepth,
      totalKeys,
      errorMessage: `Exceeded max depth: ${depth} > ${maxDepthAllowed}`,
    };
  }
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input);
    totalKeys += keys.length;
    if (totalKeys > maxKeysAllowed) {
      return {
        isValid: false,
        maxDepth,
        totalKeys,
        errorMessage: `Exceeded max keys: ${totalKeys} > ${maxKeysAllowed}`,
      };
    }
    for (const key of keys) {
      const result = checkJsonDepthAndKeys(
        input[key],
        maxDepthAllowed,
        maxKeysAllowed,
        depth + 1,
        totalKeys,
        maxDepth,
      );
      if (!result.isValid) {
        return result;
      }
      totalKeys = result.totalKeys;
      maxDepth = result.maxDepth;
    }
  }
  if (Array.isArray(input)) {
    if (input.length === 0) {
      maxDepth = Math.max(maxDepth, depth + 1);
    }
    for (const item of input) {
      const result = checkJsonDepthAndKeys(
        item,
        maxDepthAllowed,
        maxKeysAllowed,
        depth + 1,
        totalKeys,
        maxDepth,
      );
      if (!result.isValid) {
        return result;
      }
      totalKeys = result.totalKeys;
      maxDepth = result.maxDepth;
    }
  }
  return { isValid: true, maxDepth, totalKeys };
}

/**
 * Parses JSON input while also validating its depth and key count.
 *
 * @param input
 * @param maxDepth
 * @param maxKeys
 * @param errorStatus
 * @returns
 */
export function parseJsonWithDepthAndKeysValidation(
  input: string,
  maxDepth: number,
  maxKeys: number,
  errorStatus: AttestationResponseStatus,
): object | undefined {
  if (input === '') {
    return undefined;
  }
  const parsed = parseJsonExpectingObject(input, errorStatus);
  const checkedJson = checkJsonDepthAndKeys(parsed, maxDepth, maxKeys);
  if (checkedJson.isValid) {
    return parsed;
  }
  throw new Web2JsonValidationError(errorStatus, checkedJson.errorMessage);
}

/**
 * Spawns a child Node.js process to perform a computation with a given payload.
 * Validates the message format and ensures proper timeout and error handling.
 *
 * @param scriptPath - Path to the worker script (must be jq-process.js or encode-process.js)
 * @param payload - Message payload to send to the child process
 * @param timeoutMs - Maximum allowed execution time in milliseconds
 * @param timeoutErrorMessage - Error message for timeout scenarios
 * @returns Result from the child process
 */
export async function runChildProcess<T>(
  scriptPath: string,
  payload: ProcessMessage,
  timeoutMs: number,
  timeoutErrorMessage: string,
): Promise<T> {
  // validate supported script
  if (
    !scriptPath.includes('jq-process.js') &&
    !scriptPath.includes('encode-process.js')
  ) {
    throw new Error(`Unsupported script path: ${scriptPath}`);
  }
  // validate payload structure based on script
  if (scriptPath.includes('jq-process.js') && !isJqMessage(payload)) {
    throw new Error('Invalid message format for jq process');
  }
  if (scriptPath.includes('encode-process.js') && !isEncodeMessage(payload)) {
    throw new Error('Invalid message format for encode process');
  }

  // run the child process
  const processPromise = new Promise<T>((resolve, reject) => {
    const child = fork(scriptPath, [], {
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    });
    // send payload to child process
    child.send(payload);
    // handle message from child process
    child.once(
      'message',
      (message: ProcessResultMessage<T> | ProcessErrorMessage) => {
        if (message.status === 'success') {
          resolve(message.result);
        } else {
          reject(new Error(message.error));
        }
      },
    );
    // set timeout for child process
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(timeoutErrorMessage));
    }, timeoutMs);
    // clear timeout if child exits
    child.once('exit', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });

  try {
    return await processPromise;
  } catch (error) {
    throw new Error(`Error during child process (${scriptPath}): ${error}`);
  }
}

/**
 * @param message
 * @returns
 */
export function isJqMessage(message: unknown): message is JqMessage {
  if (
    typeof message === 'object' &&
    message !== null &&
    'jsonData' in message &&
    'jqScheme' in message
  ) {
    const { jsonData, jqScheme } = message as Record<string, unknown>;
    return (
      (typeof jsonData === 'object' || typeof jsonData === 'string') &&
      typeof jqScheme === 'string'
    );
  }
  return false;
}

/**
 * @param message
 * @returns
 */
export function isEncodeMessage(message: unknown): message is EncodeMessage {
  if (
    typeof message === 'object' &&
    message !== null &&
    'abiSignature' in message &&
    'jqPostProcessData' in message
  ) {
    const { abiSignature, jqPostProcessData } = message as Record<
      string,
      unknown
    >;
    return (
      typeof abiSignature === 'object' &&
      (typeof jqPostProcessData === 'string' ||
        typeof jqPostProcessData === 'object')
    );
  }
  return false;
}
