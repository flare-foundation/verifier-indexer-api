import {
  AttestationResponseStatus,
  VerificationResponse,
} from '../response-status';
import { ethers, ParamType } from 'ethers';
import { Web2Json_Response } from '../../dtos/attestation-types/Web2Json.dto';

export class Web2JsonValidationError extends Error {
  constructor(
    public readonly attestationResponseStatus: AttestationResponseStatus,
    message?: string,
  ) {
    super(message || attestationResponseStatus);
    this.name = 'Web2JsonValidationError';
  }
}

export function abiEncode(
  data: object | object[],
  abiSignature: object,
): string {
  let parsed: string[] | ParamType[];
  if (isStringArray(abiSignature as unknown)) {
    parsed = (abiSignature as string[]).map((t) => ethers.ParamType.from(t));
  } else if (Array.isArray(abiSignature)) {
    parsed = abiSignature as ParamType[];
  } else {
    parsed = [ethers.ParamType.from(abiSignature)];
  }
  return ethers.AbiCoder.defaultAbiCoder().encode(parsed, [data]);
}

export function isStringArray(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((item) => typeof item === 'string');
}

// Print only the first and last 100 characters of the encoded data for brevity
export function printResult(
  result: VerificationResponse<Web2Json_Response>,
): string {
  const data = result.response?.responseBody.abiEncodedData;
  if (data) {
    return data.length < 250
      ? data
      : data.slice(0, 100) + '...' + data.slice(-100);
  } else return 'N/A';
}
