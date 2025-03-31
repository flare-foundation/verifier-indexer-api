import { AttestationResponseStatus, VerificationResponse } from "../response-status";

export const maxContentLength = 1024 * 1024; // 1MB
export const maxTimeout = 1000; // 1s
export const maxRedirects = 0;
export const responseType = "arraybuffer"; // prevent auto-parsing

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

/**
 * Validate source URL
 * @param inputUrl
 * @returns
 */
export function isValidUrl(inputUrl: string): boolean {
  try {
    const parsedUrl = new URL(inputUrl);
    // only https is allowed
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }
    // block URLs containing word 'url'
    if (parsedUrl.href.toLowerCase().includes('url')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function verificationResponse<T>(status: AttestationResponseStatus, response?: T): VerificationResponse<T> {
    return {
        status,
        response
    }
}

export function tryParseJSON(input: string) {
  try {
      return JSON.parse(input);
  } catch {
      return null
  }
}