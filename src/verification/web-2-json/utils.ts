import { AttestationResponseStatus } from '../response-status';

export class Web2JsonValidationError extends Error {
  constructor(
    public readonly attestationResponseStatus: AttestationResponseStatus,
    message?: string,
  ) {
    super(message || attestationResponseStatus);
    this.name = 'Web2JsonValidationError';
  }
}

export function isStringArray(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((item) => typeof item === 'string');
}
