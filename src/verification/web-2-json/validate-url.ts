import * as dns from 'dns';
import * as net from 'net';
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

const NON_PUBLIC_IPV4_BLOCKLIST = createNonPublicIPv4Blocklist();
const NON_PUBLIC_IPV6_BLOCKLIST = createNonPublicIPv6Blocklist();
const PUBLIC_IPV6_ALLOWLIST = createPublicIPv6Allowlist();

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
 * Validates that the parsedUrl pathname is allowed by the endpoint.paths configuration.
 * Throws Web2JsonValidationError with INVALID_SOURCE_URL on mismatch.
 */
export function validatePath(
  parsedUrl: URL,
  supportedEndpoint: Endpoint,
): void {
  if (supportedEndpoint.paths === '*') return;

  const matched = supportedEndpoint.paths.find((p: string) => {
    const normalizedPath = p.startsWith('/') ? p : '/' + p;
    return normalizedPath === parsedUrl.pathname;
  });

  if (!matched) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_SOURCE_URL,
      `Path ${parsedUrl.pathname} not allowed for source. Allowed endpoint paths: ${JSON.stringify(
        supportedEndpoint.paths,
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
      for (const { address, family } of addresses) {
        if (!isPublicAddress(address, family)) {
          const normalizedAddress = normalizeIpAddress(address);
          throw new PrivateIPError(
            `Blocked IP: ${normalizedAddress} from ${parsedUrl.hostname}`,
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
  const hostnameToLookup = normalizeHostnameForDnsLookup(hostname);
  try {
    return await withTimeout(
      dns.promises.lookup(hostnameToLookup, { all: true }),
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
      throw new DNSTimeoutError(`DNS query timed out for ${hostnameToLookup}`);
    }

    throw error;
  }
}

function createNonPublicIPv4Blocklist(): net.BlockList {
  const blocklist = new net.BlockList();
  blocklist.addSubnet('0.0.0.0', 8, 'ipv4'); // "This network"
  blocklist.addSubnet('10.0.0.0', 8, 'ipv4'); // RFC1918 private
  blocklist.addSubnet('100.64.0.0', 10, 'ipv4'); // RFC6598 CGNAT
  blocklist.addSubnet('127.0.0.0', 8, 'ipv4'); // loopback
  blocklist.addSubnet('169.254.0.0', 16, 'ipv4'); // link-local
  blocklist.addSubnet('172.16.0.0', 12, 'ipv4'); // RFC1918 private
  blocklist.addSubnet('192.0.0.0', 24, 'ipv4'); // IETF protocol assignments
  blocklist.addSubnet('192.0.2.0', 24, 'ipv4'); // TEST-NET-1
  blocklist.addSubnet('192.88.99.0', 24, 'ipv4'); // 6to4 relay anycast
  blocklist.addSubnet('192.168.0.0', 16, 'ipv4'); // RFC1918 private
  blocklist.addSubnet('198.18.0.0', 15, 'ipv4'); // benchmark testing
  blocklist.addSubnet('198.51.100.0', 24, 'ipv4'); // TEST-NET-2
  blocklist.addSubnet('203.0.113.0', 24, 'ipv4'); // TEST-NET-3
  blocklist.addSubnet('224.0.0.0', 4, 'ipv4'); // multicast
  blocklist.addSubnet('240.0.0.0', 4, 'ipv4'); // reserved / broadcast
  return blocklist;
}

function createNonPublicIPv6Blocklist(): net.BlockList {
  const blocklist = new net.BlockList();
  blocklist.addAddress('::', 'ipv6'); // unspecified
  blocklist.addAddress('::1', 'ipv6'); // loopback
  blocklist.addSubnet('::ffff:0:0', 96, 'ipv6'); // IPv4-mapped IPv6
  blocklist.addSubnet('2001::', 23, 'ipv6'); // IANA special purpose
  blocklist.addSubnet('2001:db8::', 32, 'ipv6'); // documentation
  blocklist.addSubnet('2002::', 16, 'ipv6'); // 6to4
  blocklist.addSubnet('3fff::', 20, 'ipv6'); // documentation
  blocklist.addSubnet('fc00::', 7, 'ipv6'); // unique local
  blocklist.addSubnet('fe80::', 10, 'ipv6'); // link-local
  blocklist.addSubnet('ff00::', 8, 'ipv6'); // multicast
  return blocklist;
}

function createPublicIPv6Allowlist(): net.BlockList {
  const blocklist = new net.BlockList();
  blocklist.addSubnet('2000::', 3, 'ipv6'); // global unicast space
  return blocklist;
}

function normalizeIpAddress(address: string): string {
  const bracketStripped =
    address.startsWith('[') && address.endsWith(']')
      ? address.slice(1, -1)
      : address;
  const zoneIndex = bracketStripped.indexOf('%');
  return zoneIndex === -1
    ? bracketStripped
    : bracketStripped.slice(0, zoneIndex);
}

function isPublicIPv4(address: string): boolean {
  return !NON_PUBLIC_IPV4_BLOCKLIST.check(address, 'ipv4');
}

function isPublicIPv6(address: string): boolean {
  return (
    PUBLIC_IPV6_ALLOWLIST.check(address, 'ipv6') &&
    !NON_PUBLIC_IPV6_BLOCKLIST.check(address, 'ipv6')
  );
}

function isPublicAddress(address: string, family?: number): boolean {
  const normalizedAddress = normalizeIpAddress(address);
  const detectedFamily =
    family === 4 || family === 6 ? family : net.isIP(normalizedAddress);

  if (detectedFamily === 4) {
    return isPublicIPv4(normalizedAddress);
  }
  if (detectedFamily === 6) {
    return isPublicIPv6(normalizedAddress);
  }
  return false;
}

function normalizeHostnameForDnsLookup(hostname: string): string {
  return hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;
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
