import * as dns from 'dns';
import {
  AllowedMethods,
  Endpoint,
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
 * Performs DNS resolution and checks for private IP addresses.
 * Checks that the URL path is allowed by the endpoint configuration.
 *
 * @returns Validated URL or throws an error
 */
export async function validateUrl(
  parsedUrl: URL,
  endpoint: Endpoint,
): Promise<CheckedUrl> {
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

    // Ensure the requested path matches one of the allowed paths on the endpoint.
    // Allowed paths can be '*' (allow any) or an array of path patterns.
    // Supported pattern forms:
    //  - Exact path '/todos'
    //  - Prefix wildcard '/api/v1/*' written as '/api/v1/*' or '/api/v1*'
    if (endpoint.paths !== '*') {
      const matched = endpoint.paths.some((pattern) => {
        const normalized = pattern.startsWith('/') ? pattern : '/' + pattern;
        if (normalized.endsWith('*')) {
          const prefix = normalized.slice(0, -1);
          return parsedUrl.pathname.startsWith(prefix);
        }
        return parsedUrl.pathname === normalized;
      });
      if (!matched) {
        throw new Error(
          `Path ${parsedUrl.pathname} not allowed by endpoint paths ${JSON.stringify(
            endpoint.paths,
          )}`,
        );
      }
    }

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
