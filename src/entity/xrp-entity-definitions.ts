// External Postgres Database Entities (XRP) (read only)

import {  IXrpGetTransactionRes } from '@flarenetwork/mcc';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiDBBlock } from '../dtos/indexer/ApiDbBlock.dto';
import { ApiDBTransaction } from '../dtos/indexer/ApiDbTransaction.dto';
import { IndexerVersion } from '../dtos/indexer/ApiDbVersion.dto';
import {
  BlockResult,
  TransactionResult,
} from '../indexed-query-manager/indexed-query-manager-types';
import { ChainType } from '../config/configuration';

@Entity('blocks')
export class DBXrpIndexerBlock {
  @PrimaryColumn({ type: 'char' })
  hash: string;

  @Column()
  block_number: number;

  @Column()
  timestamp: number;

  @Column()
  transactions: number;

  toBlockResult(): BlockResult {
    return {
      blockNumber: this.block_number,
      blockHash: this.hash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      confirmed: true, // This is the Indexer DB assumption
    };
  }

  toApiDBBlock(): ApiDBBlock {
    return {
      blockNumber: this.block_number,
      blockHash: this.hash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      confirmed: true,
      numberOfConfirmations: 0,
    };
  }
}

export type IDBXrpIndexerBlock = new () => DBXrpIndexerBlock;

@Entity('transactions')
export class DBXrpTransaction {
  @PrimaryColumn({ type: 'char' })
  hash: string;

  @Column()
  block_number: number;

  @Column()
  timestamp: number;

  @Column({
    nullable: true,
  })
  payment_reference: string;

  @Column()
  source_addresses_root: string;

  @Column()
  is_native_payment: boolean;

  @Column()
  response: string;

  get transactionType(): string {
    return 'full_payment'; // TODO: This classification must be added to DB (same as MCC)
  }

  responseJson(): IXrpGetTransactionRes {
    const txData: unknown = JSON.parse(this.response);
    if (
      !(typeof txData == 'object' && 'metaData' in txData && 'hash' in txData)
    ) {
      throw new Error('Invalid response JSON');
    }
    const { metaData: _, ...txDataRest } = txData;
    const modifiedTxData: IXrpGetTransactionRes = {
      result: {
        ...txDataRest,
        hash: txData.hash,
        ledger_index: this.block_number,
        meta: txData.metaData,
        validated: true,
        date: this.timestamp,
      } as IXrpGetTransactionRes['result'],
      id: '',
      type: '',
    };
    return modifiedTxData;
  }

  toTransactionResult(): TransactionResult {
    const response = this.responseJson();
    return {
      getResponse() {
        return JSON.stringify(response);
      },
      chainType: ChainType.XRP,
      transactionId: this.hash,
      blockNumber: this.block_number,
      timestamp: this.timestamp,
      paymentReference: this.payment_reference,
      isNativePayment: this.is_native_payment,
      transactionType: this.transactionType,
    };
  }

  toApiDBTransaction(returnResponse: boolean = false): ApiDBTransaction {
    const baseRes = {
      id: 0,
      chainType: ChainType.XRP,
      transactionId: this.hash,
      blockNumber: this.block_number,
      timestamp: this.timestamp,
      paymentReference: this.payment_reference,
      isNativePayment: this.is_native_payment,
      transactionType: this.transactionType,
      response: '',
    };
    if (returnResponse) {
      return {
        ...baseRes,
        response: this.responseJson(),
      };
    }
    return baseRes;
  }
}

export type IDBXrpTransaction = new () => DBXrpTransaction;

@Entity('states')
export class DBXrpState {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column()
  last_chain_block_number: number;

  @Column()
  last_chain_block_timestamp: number;

  @Column()
  last_chain_block_updated: number;

  @Column()
  last_indexed_block_number: number;

  @Column()
  last_indexed_block_timestamp: number;

  @Column()
  last_indexed_block_updated: number;

  @Column()
  first_indexed_block_number: number;

  @Column()
  first_indexed_block_timestamp: number;

  @Column()
  last_history_drop: number;
}

export type IDBXrpState = new () => DBXrpState;

@Entity('versions')
export class DBXrpIndexerVersion {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column()
  node_version: string;

  @Column()
  git_tag: string;

  @Column()
  git_hash: string;

  @Column()
  build_date: number;

  @Column()
  num_confirmations: number;

  @Column()
  history_seconds: number;

  toIndexerVersion(): IndexerVersion {
    return {
      gitTag: this.git_tag,
      gitHash: this.git_hash,
      buildDate: this.build_date,
      numConfirmations: this.num_confirmations,
      historySeconds: this.history_seconds,
    };
  }

  toNodeVersion(): string {
    return this.node_version;
  }
}

export type IDBXrpIndexerVersion = new () => DBXrpIndexerVersion;
