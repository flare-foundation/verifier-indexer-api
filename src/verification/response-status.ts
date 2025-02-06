import {
  ConfirmedBlockQueryResponse,
  ConfirmedTransactionQueryResponse,
  ReferencedTransactionsQueryResponse,
} from '../indexed-query-manager/indexed-query-manager-types';

/**
 * Enumerated attestion response status
 */
export enum AttestationResponseStatus {
  // VALID STATUS
  VALID = 'VALID',

  // MALFORMED STATUS
  MALFORMED = 'MALFORMED ATTESTATION REQUEST',

  // INDETERMINATE STATUSES
  // Source failure - error in checking
  SYSTEM_FAILURE = 'INDETERMINATE: SYSTEM_FAILURE',

  // ERROR STATUSES
  INVALID = 'INVALID',
  BLOCK_AVAILABILITY_ISSUE = 'INVALID: BLOCK DOES NOT EXIST',
  TRANSACTION_AVAILABILITY_ISSUE = 'INVALID: TRANSACTION DOES NOT EXIST',
  COINBASE_TRANSACTION = 'INVALID: COINBASE TRANSACTION',
  INVALID_UTXOS = 'INVALID: INVALID INPUT OR OUTPUT OF THE TRANSACTION',
  NO_SOURCE_ADDRESS = 'INVALID: INVALID SOURCE ADDRESS',
  NO_INTENDED_SOURCE_ADDRESS = 'INVALID: NO INTENDED SOURCE ADDRESS',
  INVALID_ADDRESS_FORMAT = 'INVALID: INVALID ADDRESS FORMAT',
  NO_RECEIVING_ADDRESS = 'INVALID: NO RECEIVING ADDRESS',
  NO_INTENDED_RECEIVING_ADDRESS = 'INVALID: NO INTENDED RECEIVING ADDRESS',
  UNEXPECTED_NUMBER_OF_PARTICIPANTS = 'INVALID: UNEXPECTED NUMBER OF PARTICIPANTS IN TRANSACTION',
  NO_NATIVE_PAYMENT = 'INVALID: NOT NATIVE PAYMENT TRANSACTION',
  NOT_STANDARD_PAYMENT_REFERENCE = 'INVALID: INVALID STANDARD PAYMENT REFERENCE',
  ZERO_PAYMENT_REFERENCE_UNSUPPORTED = 'INVALID: ZERO PAYMENT REFERENCE UNSUPPORTED',
  NOT_STANDARD_SOURCE_ADDRESS_ROOT = 'INVALID: INVALID SOURCE ADDRESS ROOT',
  INVALID_SEARCH_RANGE = 'INVALID: INVALID SEARCH RANGE',
  REFERENCED_TRANSACTION_EXISTS = 'INVALID: REFERENCED TRANSACTION EXISTS',
  MORE_THAN_ONE_OUTPUT = 'INVALID: MORE THAN ONE OUTPUT',
  INVALID_ADDRESS_CHARACTER = 'INVALID: INVALID ADDRESS CHARACTER',
  INVALID_ADDRESS_VERSION = 'INVALID: INVALID ADDRESS VERSION',
  INVALID_ADDRESS_LENGTH = 'INVALID: INVALID ADDRESS LENGTH',
  INVALID_DECODED_ADDRESS_LENGTH = 'INVALID: INVALID DECODED ADDRESS LENGTH',
  INVALID_ADDRESS_CHECKSUM = 'INVALID: INVALID ADDRESS CHECKSUM',
  INVALID_ADDRESS_TYPE = 'INVALID: INVALID ADDRESS TYPE',
  INVALID_JQ_PARSE_ERROR = 'INVALID: JQ_PARSE_ERROR',
  INVALID_DATA_AVAILABILITY_ISSUE = 'INVALID: DATA AVAILABILITY ISSUE',
  INVALID_FETCH_OR_RESPONSE_ERROR = 'INVALID: FETCH_OR_RESPONSE_ERROR',

  // TEMPORARY STATUS
  // Temporary status during checks
  NEEDS_MORE_CHECKS = 'INDETERMINATE: NEEDS_MORE_CHECKS',
}

export interface VerificationResponse<T> {
  status: AttestationResponseStatus;
  response?: T;
}

//////////////////////////////////////////////////
// Implementations of generic functions for error
// handling. Used in verification functions
//////////////////////////////////////////////////

export function verifyWorkflowForTransaction(
  result: ConfirmedTransactionQueryResponse,
): AttestationResponseStatus {
  switch (result.status) {
    case 'OK':
      return AttestationResponseStatus.NEEDS_MORE_CHECKS;
    case 'NOT_EXIST':
      return AttestationResponseStatus.TRANSACTION_AVAILABILITY_ISSUE;
    default:
      // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
      ((_: never): void => {})(result.status);
  }
}

export function verifyWorkflowForBlock(
  result: ConfirmedBlockQueryResponse,
): AttestationResponseStatus {
  switch (result.status) {
    case 'OK':
      return AttestationResponseStatus.NEEDS_MORE_CHECKS;
    case 'NOT_EXIST':
      return AttestationResponseStatus.BLOCK_AVAILABILITY_ISSUE;
    default:
      // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
      ((_: never): void => {})(result.status);
  }
}

export function verifyWorkflowForReferencedTransactions(
  result: ReferencedTransactionsQueryResponse,
): AttestationResponseStatus {
  switch (result.status) {
    case 'OK':
      return AttestationResponseStatus.NEEDS_MORE_CHECKS;
    case 'NO_OVERFLOW_BLOCK':
    case 'DATA_AVAILABILITY_FAILURE':
      return AttestationResponseStatus.BLOCK_AVAILABILITY_ISSUE;
    default:
      // exhaustive switch guard: if a compile time error appears here, you have forgotten one of the cases
      ((_: never): void => {})(result.status);
  }
}
