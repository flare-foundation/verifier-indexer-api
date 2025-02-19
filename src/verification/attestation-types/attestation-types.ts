//////////////////////////////////////////////////////////////////////////////////////////////////////
// Verification status
//////////////////////////////////////////////////////////////////////////////////////////////////////

import { AttestationResponseStatus } from '../../dtos/generic/generic.dto';

/**
 * Enumerated verification status of attestation
 */
export enum VerificationStatus {
  ///////////////////////////
  // VALID STATUS
  ///////////////////////////

  OK = 'OK',

  ///////////////////////////
  // INDETERMINATE STATUSES
  ///////////////////////////

  DATA_AVAILABILITY_ISSUE = 'DATA_AVAILABILITY_ISSUE',
  // Temporary status during checks
  NEEDS_MORE_CHECKS = 'NEEDS_MORE_CHECKS',
  // Source failure - error in checking
  SYSTEM_FAILURE = 'SYSTEM_FAILURE',

  NON_EXISTENT_BLOCK = 'NON_EXISTENT_BLOCK',

  ///////////////////////////
  // ERROR STATUSES
  ///////////////////////////

  // generic invalid response
  NOT_CONFIRMED = 'NOT_CONFIRMED',

  NON_EXISTENT_TRANSACTION = 'NON_EXISTENT_TRANSACTION',

  NOT_PAYMENT = 'NOT_PAYMENT',

  REFERENCED_TRANSACTION_EXISTS = 'REFERENCED_TRANSACTION_EXISTS',
  ZERO_PAYMENT_REFERENCE_UNSUPPORTED = 'ZERO_PAYMENT_REFERENCE_UNSUPPORTED',
  NOT_STANDARD_PAYMENT_REFERENCE = 'NOT_STANDARD_PAYMENT_REFERENCE',
  NOT_STANDARD_SOURCE_ADDRESS_ROOT = 'NOT_STANDARD_SOURCE_ADDRESS_ROOT',
  PAYMENT_SUMMARY_ERROR = 'PAYMENT_SUMMARY_ERROR',
}


export function getAttestationStatus(
  status: VerificationStatus,
): AttestationResponseStatus {
  switch (status) {
    case VerificationStatus.OK:
      return AttestationResponseStatus.VALID;
    case VerificationStatus.DATA_AVAILABILITY_ISSUE:
    case VerificationStatus.NEEDS_MORE_CHECKS:
    case VerificationStatus.SYSTEM_FAILURE:
    case VerificationStatus.NON_EXISTENT_BLOCK:
      return AttestationResponseStatus.INDETERMINATE;
    case VerificationStatus.NOT_CONFIRMED:
    case VerificationStatus.NON_EXISTENT_TRANSACTION:
    case VerificationStatus.NOT_PAYMENT:
    case VerificationStatus.REFERENCED_TRANSACTION_EXISTS:
    case VerificationStatus.ZERO_PAYMENT_REFERENCE_UNSUPPORTED:
    case VerificationStatus.NOT_STANDARD_PAYMENT_REFERENCE:
    case VerificationStatus.NOT_STANDARD_SOURCE_ADDRESS_ROOT:
    case VerificationStatus.PAYMENT_SUMMARY_ERROR:
      return AttestationResponseStatus.INVALID;
  }
  // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases

  ((_: never): void => {})(status);
}
