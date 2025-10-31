import { AttestationResponseStatus } from '../response-status';
import { ethers, ParamType } from 'ethers';
import { HttpException, HttpStatus } from '@nestjs/common';

export class Web2JsonValidationError extends Error {
  constructor(
    public readonly attestationResponseStatus: AttestationResponseStatus,
    message?: string,
  ) {
    super(attestationResponseStatus + (message ? `: ${message}` : ''));
    this.name = 'Web2JsonValidationError';
  }
}

export class BackpressureException extends HttpException {
  constructor() {
    super(
      'Server is busy, too many pending requests',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export function abiEncode(data: object | object[], abiType: ParamType): string {
  const values = Array.isArray(data) ? data : [data];
  return ethers.AbiCoder.defaultAbiCoder().encode([abiType], values);
}

export function getPreview(data: string): string {
  if (!data) return '';
  return data.length < 250
    ? data
    : data.slice(0, 100) + '...' + data.slice(-100);
}
