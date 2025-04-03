import { AllowedMethods } from 'src/config/interfaces/json-api';
import {
  AttestationResponseStatus,
  VerificationResponse,
} from '../response-status';
import { Logger } from '@nestjs/common';
import * as dns from 'dns';
import { Json } from 'node-jq/lib/options';
import { AxiosHeaderValue } from 'axios';

export const responseType = 'arraybuffer'; // prevent auto-parsing
export const responseContentType = 'application/json';

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
export async function isValidUrl(inputUrl: string, blockedHostnames: string[]): Promise<boolean> {
  try {
    const parsedUrl = new URL(inputUrl);
    // only https is allowed
    if (parsedUrl.protocol !== 'https:') {
      Logger.warn(`URL rejected: not 'https' protocol`);
      return false;
    }
    // block URLs containing word 'url'
    if (parsedUrl.href.toLowerCase().includes('url')) {
      Logger.warn(`URL rejected: containing 'url'`);
      return false;
    }
    // resolve hostname to IP address
    try {
      const addresses = await dns.promises.lookup(parsedUrl.hostname, { all: true });
      for (const { address } of addresses) {
        // check if IP is private
        if (ipPrivate.some((regex) => regex.test(address))) {
          Logger.warn(`URL rejected: blocked IP - ${address} resolved from ${parsedUrl.hostname}`);
          return false;
        }
      }
    } catch (error) {
      Logger.warn(`URL rejected: DNS resolution failed for ${parsedUrl.hostname}: ${error}`);
      return false;
    }
    // blocked hostnames
    if (blockedHostnames.some(blocked => parsedUrl.hostname === blocked || parsedUrl.hostname.endsWith(`.${blocked}`))) {
      Logger.warn(`URL rejected: blocked hostname included ${parsedUrl.hostname}`);
      return false;
    }
    return true;
  } catch (error) {
    Logger.error(`Error while validating URL: ${error}`);
    return false;
  }
}

/**
 * @param status
 * @param response
 * @returns
 */
export function verificationResponse<T>(status: AttestationResponseStatus, response?: T): VerificationResponse<T> {
  return {
    status,
    response,
  };
}

/**
 * @param input
 * @returns
 */
export function tryParseJSON(input: string) {
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
export function isValidHttpMethod(httpMethod: HTTP_METHOD, allowedHttpMethods: AllowedMethods) {
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
  return Array.isArray(data) && data.every(item => typeof item === 'string');
}

/**
 * @param data
 * @returns
 */
export function isJson(data: unknown): data is Json {
  if (typeof data === "string" || typeof data === "number" ||
    typeof data === "boolean" || data === null) {
    return true;
  }
  if (Array.isArray(data)) {
    return data.every(isJson);
  }
  if (typeof data === "object" && data !== null) {
    return Object.values(data).every(isJson);
  }
  return false;
}

export function isApplicationJsonContentType(contentType: AxiosHeaderValue): boolean {
  if (typeof contentType === 'string' && contentType.includes(responseContentType)) {
    return true;
  } else if (Array.isArray(contentType)) {
    if (contentType.some(type => type.includes(responseContentType))) {
      return true;
    }
  } else {
    return false;
  }
}
