import { ChainType } from '@flarenetwork/mcc';
import { EntityManager } from 'typeorm';

export interface IndexedQueryManagerOptions {
  chainType: ChainType;
  entityManager: EntityManager;
  numberOfConfirmations: () => number;
}

export interface BlockHeightSample {
  height: number;
  timestamp: number;
}

////////////////////////////////////////////////////////
/// Result interfaces
////////////////////////////////////////////////////////

export interface TransactionResult {
  getResponse(): string;
  chainType: number;
  transactionId: string;
  blockNumber: number;
  timestamp: number;
  paymentReference: string;
  isNativePayment: boolean;
  transactionType: string;
}

export interface BlockResult {
  blockNumber: number;
  timestamp: number;
  transactions: number;
  confirmed: boolean;
  blockHash: string;
}

////////////////////////////////////////////////////////
/// General query params
////////////////////////////////////////////////////////

export interface TransactionQueryParams {
  chainType?: ChainType;
  startBlockNumber?: number;
  endBlockNumber?: number;
  transactionId?: string;
  paymentReference?: string;
  sourceAddressRoot?: string;
}

export interface BlockQueryParams {
  hash?: string;
  blockNumber?: number;
  confirmed?: boolean;
}

export interface TransactionQueryResult {
  result: TransactionResult[];
  startBlock?: BlockResult;
  endBlock?: BlockResult;
}

export interface BlockQueryResult {
  result?: BlockResult;
}

////////////////////////////////////////////////////////
/// Specific query requests and responses
////////////////////////////////////////////////////////

export interface ConfirmedBlockQueryRequest {
  blockNumber: number;
}

export type ConfirmedBlockQueryStatusType = 'OK' | 'NOT_EXIST';
export interface ConfirmedBlockQueryResponse {
  status: ConfirmedBlockQueryStatusType;
  block?: BlockResult;
}
export interface ConfirmedTransactionQueryRequest {
  txId: string; // transaction id
}

export type ConfirmedTransactionQueryStatusType = 'OK' | 'NOT_EXIST';
export interface ConfirmedTransactionQueryResponse {
  status: ConfirmedTransactionQueryStatusType;
  transaction?: TransactionResult;
}

export interface ReferencedTransactionsQueryRequest {
  minimalBlockNumber: number;
  deadlineBlockNumber: number;
  deadlineBlockTimestamp: number;
  paymentReference: string; // payment reference
  sourceAddressRoot?: string; // source address root
}

export type ReferencedTransactionsQueryStatusType =
  | 'OK'
  | 'NO_OVERFLOW_BLOCK'
  | 'DATA_AVAILABILITY_FAILURE';
export interface ReferencedTransactionsQueryResponse {
  status: ReferencedTransactionsQueryStatusType;
  transactions?: TransactionResult[];
  firstOverflowBlock?: BlockResult;
  minimalBlock?: BlockResult;
}
