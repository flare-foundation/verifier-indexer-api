import * as dns from 'dns';
import {
  AllowedMethods,
  Endpoint,
  EndpointPath,
  HTTP_METHOD,
} from '../../config/interfaces/web2-json';
import { AttestationResponseStatus } from '../response-status';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { Web2JsonValidationError } from './utils';

class PrivateIPError extends Error {}
class DNSTimeoutError extends Error {}

export interface CheckedUrl {
  hostname: string;
  lookUpAddresses: dns.LookupAddress[];
  url: string;
}

const DNS_LOOKUP_TIMEOUT_MS = 2_000;

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
 * Parses and sanitizes the input URL. Rejects URLs that exceed the allowed length
 * or use non-HTTPS protocols.
 *
 * @returns Parsed URL object or throws an error
 */
export function parseUrl(inputUrl: string, allowedUrlLength: number): URL {
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
  return parsedUrl;
}

/**
 * Validates that the parsedUrl pathname is allowed by the endpoint.paths configuration
 * and enforces any postProcessJq requirement for that path.
 * Throws Web2JsonValidationError with INVALID_SOURCE_URL on mismatch.
 */
export function validateEndpointPath(
  parsedUrl: URL,
  endpoint: Endpoint,
  jqScheme: string,
): void {
  if (endpoint.paths === '*') return;

  const matched = endpoint.paths.find(
    (p: EndpointPath | string) => {
      const path = typeof p === 'string' ? p : p.path;
      const normalizedPath = path.startsWith('/') ? path : '/' + path;
      if (normalizedPath === parsedUrl.pathname) {
        if (typeof p !== 'string' && p.postProcessJq) {
          if (p.postProcessJq !== jqScheme) {
            throw new Web2JsonValidationError(
              AttestationResponseStatus.INVALID_SOURCE_URL,
              `JQ filter '${jqScheme}' does not match required filter '${p.postProcessJq}' for path '${normalizedPath}'`,
            );
          }
        }
        return true;
      }
      return false;
    },
  );

  if (!matched) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_SOURCE_URL,
      `Path ${parsedUrl.pathname} not allowed by endpoint paths ${JSON.stringify(
        endpoint.paths,
      )}`,
    );
  }
}

/**
 * Performs DNS resolution and checks for private IP addresses.
 *
 * @returns Validated URL or throws an error
 */
export async function validateUrl(parsedUrl: URL): Promise<CheckedUrl> {
  try {
    const checkedUrl: CheckedUrl = {
      hostname: '',
      url: '',
      lookUpAddresses: [],
    };
    // Perform DNS resolution and check for private IP addresses
    try {
      const addresses = await dnsLookupWithTimeout(parsedUrl.hostname);
      for (const { address } of addresses) {
        // Check if IP is private
        if (ipPrivate.some((regex) => regex.test(address))) {
          throw new PrivateIPError(
            `Blocked IP: ${address} from ${parsedUrl.hostname}`,
          );
        }
      }
      checkedUrl.lookUpAddresses = addresses;
    } catch (error) {
      if (error instanceof PrivateIPError) {
        throw error;
      }
      if (error instanceof DNSTimeoutError) {
        throw error;
      }
      throw new Error(
        `DNS resolution failed for ${parsedUrl.hostname}: ${error}`,
      );
    }
    checkedUrl.url =
      parsedUrl.protocol + '//' + parsedUrl.hostname + parsedUrl.pathname;
    checkedUrl.hostname = parsedUrl.hostname;

    if (
      !checkedUrl.hostname ||
      !checkedUrl.url ||
      !checkedUrl.lookUpAddresses ||
      checkedUrl.lookUpAddresses.length === 0
    ) {
      throw new Error('Missing data in CheckedUrl');
    }
    return checkedUrl;
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_SOURCE_URL,
      `Error while validating URL: ${error}`,
    );
  }
}

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

async function dnsLookupWithTimeout(
  hostname: string,
): Promise<dns.LookupAddress[]> {
  try {
    return await withTimeout(
      dns.promises.lookup(hostname, { all: true }),
      DNS_LOOKUP_TIMEOUT_MS,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (('code' in error &&
        (error as { code?: string }).code !== undefined &&
        ((error as { code: string }).code === 'ETIMEOUT' ||
          (error as { code: string }).code === 'EAI_AGAIN')) ||
        error.message.includes('timed out after'))
    ) {
      throw new DNSTimeoutError(`DNS query timed out for ${hostname}`);
    }

    throw error;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        if (err instanceof Error) {
          reject(err);
        } else {
          reject(new Error(String(err)));
        }
      });
  });
}
