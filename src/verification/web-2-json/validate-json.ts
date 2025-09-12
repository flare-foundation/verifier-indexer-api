import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';

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
 * Validates the depth and the number of keys in a JSON object.
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
