import { AxiosHeaderValue, AxiosResponse } from 'axios';
import { Web2JsonValidationError } from './utils';
import { AttestationResponseStatus } from '../response-status';

export const RESPONSE_CONTENT_TYPE_JSON = 'application/json';

export function parseAndValidateResponse(
  sourceResponse: AxiosResponse<ArrayBuffer>,
) {
  // validate content-type header
  const contentType: AxiosHeaderValue = sourceResponse.headers[
    'content-type'
  ] as AxiosHeaderValue;
  validateApplicationJsonContentType(contentType);
  // validate returned JSON structure
  return validateResponseContentData(
    Buffer.from(sourceResponse.data).toString('utf-8'),
  );
}

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

export function validateResponseContentData(input: string): object | string {
  try {
    const parsed = JSON.parse(input) as unknown;
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
