import {
  AllowedMethods,
  JqErrorMessage,
  JqResultMessage,
} from 'src/config/interfaces/json-api';
import {
  AttestationResponseStatus,
  VerificationResponse,
} from '../response-status';
import { Logger } from '@nestjs/common';
import * as dns from 'dns';
import { AxiosHeaderValue } from 'axios';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { fork } from 'child_process';

export const DEFAULT_RESPONSE_TYPE = 'arraybuffer'; // prevent auto-parsing
export const RESPONSE_CONTENT_TYPE_JSON = 'application/json';
export const MAX_DEPTH_ONE = 1;
export const JQ_TIMEOUT_ERROR_MESSAGE = 'jq process exceeded timeout';

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
 * Validate source URL
 * @param inputUrl
 * @param blockedHostnames
 * @returns
 */
export async function isValidUrl(
  inputUrl: string,
  blockedHostnames: string[],
  allowedUrlLength: number,
): Promise<string | null> {
  try {
    const sanitizedInputUrl = sanitizeUrl(inputUrl);
    if (sanitizedInputUrl.length > allowedUrlLength) {
      Logger.warn(`URL rejected: too long - ${sanitizedInputUrl.length}`);
      return null;
    }
    const parsedUrl = new URL(sanitizedInputUrl);
    // only https is allowed
    if (parsedUrl.protocol !== 'https:') {
      Logger.warn(`URL rejected: not 'https' protocol`);
      return null;
    }
    // block URLs containing word 'url'
    if (parsedUrl.href.toLowerCase().includes('url')) {
      Logger.warn(`URL rejected: containing 'url'`);
      return null;
    }
    // resolve hostname to IP address
    try {
      const addresses = await dns.promises.lookup(parsedUrl.hostname, {
        all: true,
      });
      for (const { address } of addresses) {
        // check if IP is private
        if (ipPrivate.some((regex) => regex.test(address))) {
          Logger.warn(
            `URL rejected: blocked IP - ${address} resolved from ${parsedUrl.hostname}`,
          );
          return null;
        }
      }
    } catch (error) {
      Logger.warn(
        `URL rejected: DNS resolution failed for ${parsedUrl.hostname}: ${error}`,
      );
      return null;
    }
    // blocked hostnames
    if (
      blockedHostnames.some(
        (blocked) =>
          parsedUrl.hostname === blocked ||
          parsedUrl.hostname.endsWith(`.${blocked}`),
      )
    ) {
      Logger.warn(
        `URL rejected: blocked hostname included ${parsedUrl.hostname}`,
      );
      return null;
    }
    const checkedUrl =
      parsedUrl.protocol + parsedUrl.hostname + parsedUrl.pathname;
    return checkedUrl;
  } catch (error) {
    Logger.error(`Error while validating URL: ${error}`);
    return null;
  }
}

/**
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
 * @param input
 * @returns
 */
export function tryParseJson(input: string): object {
  try {
    const parsed = JSON.parse(input) as unknown;
    if (typeof parsed === 'object') {
      return parsed;
    }
    return null;
  } catch (error) {
    Logger.error(`Error while parsing JSON: ${error}`);
    return null;
  }
}

/**
 * @param httpMethod
 * @param allowedHttpMethods
 * @returns
 */
export function isValidHttpMethod(
  httpMethod: HTTP_METHOD,
  allowedHttpMethods: AllowedMethods,
) {
  if (allowedHttpMethods === '*') {
    return true;
  }
  return allowedHttpMethods.includes(httpMethod);
}

/**
 * @param data
 * @returns
 */
export function isStringArray(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((item) => typeof item === 'string');
}

/**
 * @param data
 * @returns
 */
export function isJson(data: unknown): boolean {
  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean' ||
    data === null
  ) {
    return true;
  }
  if (Array.isArray(data)) {
    return data.every(isJson);
  }
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).every(isJson);
  }
  return false;
}

export function isApplicationJsonContentType(
  contentType: AxiosHeaderValue,
): boolean {
  if (
    typeof contentType === 'string' &&
    contentType.includes(RESPONSE_CONTENT_TYPE_JSON)
  ) {
    return true;
  } else if (Array.isArray(contentType)) {
    if (contentType.some((type) => type.includes(RESPONSE_CONTENT_TYPE_JSON))) {
      return true;
    }
  } else {
    return false;
  }
}

export function checkJsonDepthAndKeys(
  input: unknown,
  maxDepthAllowed: number,
  maxKeysAllowed: number,
  depth: number = 0,
  totalKeys: number = 0,
  maxDepth: number = 0,
): { isValid: boolean; maxDepth: number; totalKeys: number } {
  if (depth > maxDepth) {
    maxDepth = depth;
  }
  if (depth > maxDepthAllowed) {
    Logger.warn(`Exceeded max depth: ${depth} > ${maxDepthAllowed}`);
    return { isValid: false, maxDepth, totalKeys };
  }
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input);
    totalKeys += keys.length;
    if (totalKeys > maxKeysAllowed) {
      Logger.warn(`Exceeded max keys: ${totalKeys} > ${maxKeysAllowed}`);
      return { isValid: false, maxDepth, totalKeys };
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
 * @param input
 * @param maxDepth
 * @param maxKeys
 * @returns
 */
export function parseJsonWithDepthAndKeysValidation(
  input: string,
  maxDepth: number,
  maxKeys: number,
): object {
  const parsed = tryParseJson(input);
  if (!parsed) {
    return null;
  }
  const checkedJson = checkJsonDepthAndKeys(parsed, maxDepth, maxKeys);
  if (checkedJson.isValid) {
    return parsed;
  } else {
    return null;
  }
}

export async function runJqSeparately(
  jsonData: object,
  jqScheme: string,
  timeoutMs: number,
): Promise<object> {
  const processPromise = new Promise<object>((resolve, reject) => {
    const jqChildProcess = fork('./dist/verification/json-api/jq-process.js');
    jqChildProcess.send({ jsonData, jqScheme });

    jqChildProcess.on(
      'message',
      (message: JqResultMessage | JqErrorMessage) => {
        if (message.status === 'success') {
          resolve(message.result);
        } else {
          reject(new Error(message.error));
        }
      },
    );

    const timeout = setTimeout(() => {
      jqChildProcess.kill();
      reject(new Error(JQ_TIMEOUT_ERROR_MESSAGE));
    }, timeoutMs);

    jqChildProcess.on('exit', () => {
      clearTimeout(timeout);
    });
  });

  try {
    const dataJq = await processPromise;
    return dataJq;
  } catch (error) {
    Logger.error(`Error during jq process: ${error}`);
    return null;
  }
}
