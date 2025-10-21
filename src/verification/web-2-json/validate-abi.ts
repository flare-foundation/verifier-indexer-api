import { ParamType } from 'ethers';
import { AttestationResponseStatus } from '../response-status';
import { Web2JsonValidationError } from './utils';

/**
 * Parses an ABI type from a string or JSON representation.
 *
 * Supported formats:
 * - String form for primitives: e.g., "uint256"
 * - JSON form for structs: e.g., {"type":"tuple","components":[...]}
 */
export function parseAndValidateAbiType(
  abiSignature: string,
  maxAbiSignatureLength: number,
): ParamType {
  if (abiSignature.length > maxAbiSignatureLength) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_ABI_SIGNATURE,
      `ABI signature exceeds maximum length of ${maxAbiSignatureLength}`,
    );
  }

  const abiType = parseType(abiSignature.trim());
  validateAbiType(abiType);

  return abiType;
}

/**
 * Parses the ABI type from a request ABI signature string.
 */
function parseType(abiSignature: string) {
  try {
    const maybeJson = tryParseJson(abiSignature);
    if (maybeJson !== undefined) {
      if (Array.isArray(maybeJson)) {
        throw new Error(
          'Array ABI forms are not supported; provide a tuple JSON or a string',
        );
      }
      if (maybeJson && typeof maybeJson === 'object') {
        return ParamType.from(maybeJson);
      }
    } else {
      // Assume primitive type string. We don't allow tuples here with unnamed components.
      const type = ParamType.from(abiSignature);
      if (type.baseType === 'array' || type.baseType === 'tuple') {
        throw new Error(
          'Invalid ABI type format; expected a single primitive type string',
        );
      }
      return type;
    }
  } catch (error) {
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_ABI_SIGNATURE,
      'Unable to parse ABI type: ' + (error as Error).message,
    );
  }
}

function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Only primitive types and non-nested tuples are allowed.
 */
function validateAbiType(abiType: ParamType): void {
  try {
    if (abiType.baseType === 'array') {
      throw new Error(
        'Array ABI forms are not supported; provide a tuple JSON or a string',
      );
    }
    if (abiType.baseType === 'tuple') {
      validateComponents(abiType.components ?? []);
    }
    // If not a tuple and not an array, treat as primitive — allowed
  } catch (err) {
    if (err instanceof Web2JsonValidationError) throw err;
    throw new Web2JsonValidationError(
      AttestationResponseStatus.INVALID_ABI_SIGNATURE,
      `Unable to validate ABI type: ${(err as Error)?.message ?? String(err)}`,
    );
  }
}

/**
 * Validates that tuple components are non-nested and non-array types.
 */
function validateComponents(components: readonly ParamType[]): void {
  if (components.length === 0) {
    throw new Error('Tuple ABI must include components');
  }
  for (const param of components) {
    if (param.baseType === 'tuple') {
      throw new Error(
        `Nested tuples are not supported (field ${param.name ?? '<unknown>'})`,
      );
    }
    if (param.baseType === 'array') {
      throw new Error(
        `Array types are not supported (field ${param.name ?? '<unknown>'})`,
      );
    }
  }
}
