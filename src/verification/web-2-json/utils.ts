import { AttestationResponseStatus } from '../response-status';
import { ethers, ParamType } from 'ethers';

export class Web2JsonValidationError extends Error {
  constructor(
    public readonly attestationResponseStatus: AttestationResponseStatus,
    message?: string,
  ) {
    super(message || attestationResponseStatus);
    this.name = 'Web2JsonValidationError';
  }
}

export function abiEncode(data: unknown, abiSignature: object): string {
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
