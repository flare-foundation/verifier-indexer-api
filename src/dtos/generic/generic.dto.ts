///////////////////////////////////////////////////////////////
// THIS IS GENERATED CODE. DO NOT CHANGE THIS FILE MANUALLY .//
///////////////////////////////////////////////////////////////

/**
 * Attestation status
 */
export enum AttestationResponseStatus {
  /**
   * Attestation request is valid.
   */
  VALID = 'VALID',
  /**
   * Attestation request is invalid.
   */
  INVALID = 'INVALID',
  /**
   * Attestation request cannot be confirmed neither rejected by the verifier at the moment.
   */
  INDETERMINATE = 'INDETERMINATE',
}

export class AttestationResponseVerificationEncoded {
  constructor(params: Required<AttestationResponseVerificationEncoded>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  /**
   * Abi encoded request object see this for more info: https://gitlab.com/flarenetwork/state-connector-protocol/-/blob/main/attestation-objects/request-encoding-decoding.md
   */
  abiEncodedResponse?: string;
}

/**
 * This is a general object definition independent of the attestation type this verifier is implementing
 */
export class EncodedRequestResponse {
  constructor(params: {
    status: AttestationResponseStatus;
    abiEncodedRequest?: string;
  }) {
    Object.assign(this, params);
  }

  /**
   * Verification status.
   */
  status: AttestationResponseStatus;

  /**
   * Abi encoded request object see this for more info: https://gitlab.com/flarenetwork/state-connector-protocol/-/blob/main/attestation-objects/request-encoding-decoding.md
   */
  abiEncodedRequest?: string;
}

export class EncodedRequest {
  /**
   * Abi encoded request object see this for more info: https://gitlab.com/flarenetwork/state-connector-protocol/-/blob/main/attestation-objects/request-encoding-decoding.md
   */
  abiEncodedRequest: string;
}

export class MicResponse {
  constructor(params: {
    status: AttestationResponseStatus;
    messageIntegrityCode?: string;
  }) {
    Object.assign(this, params);
  }

  /**
   * Verification status.
   */
  status: AttestationResponseStatus;

  /**
   * Message integrity code
   */
  messageIntegrityCode?: string;
}

/**
 * Object returned as a result of attestation.
 * If status is 'VALID' then parameters @param response contains attestation response.
 * Otherwise, @param response is undefined.
 */
export class AttestationResponse<RES> {
  /**
   * Verification status.
   */
  status!: AttestationResponseStatus;
  /**
   * Attestation response.
   */
  response?: RES;
}

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseEncoded {
  constructor(params: Required<AttestationResponseEncoded>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  /**
   * Abi encoded request object see this for more info: https://gitlab.com/flarenetwork/state-connector-protocol/-/blob/main/attestation-objects/request-encoding-decoding.md
   */
  abiEncodedResponse?: string;
}
