// External Postgres Database Entities (XRP) (read only)

import { ChainType } from '@flarenetwork/mcc';
import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction';
import {
  BlockResult,
  TransactionResult,
} from 'src/indexed-query-manager/indexed-query-manager-types';
import { Column, Entity, PrimaryColumn } from 'typeorm';

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
      previousBlockHash: 'Add me', // TODO: update indexer and add this field
    };
  }
}

export type IDBXrpIndexerBlock = new () => DBXrpIndexerBlock;

@Entity('transactions')
export class DBXrpTransaction {
  @PrimaryColumn({ type: 'char' })
  transaction_id: string;

  @Column()
  block_number: number;

  @Column()
  timestamp: number;

  @Column()
  payment_reference: string;

  @Column()
  is_native_payment: boolean;

  @Column()
  response: string;

  get transactionType(): string {
    return 'full_payment'; // TODO: This classification must be added to DB (same as MCC)
  }

  toTransactionResult(): TransactionResult {
    const response = JSON.stringify(this.response);
    return {
      getResponse() {
        return response;
      },
      chainType: ChainType.XRP, // TODO: ad a chainType variable
      transactionId: this.transaction_id,
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
      chainType: ChainType.DOGE, // TODO: ad a chainType variable
      transactionId: this.transaction_id,
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
        response: this.response,
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
  name: string;

  @Column()
  index: number;

  @Column()
  block_timestamp: number;

  @Column()
  updated: number;
}

export type IDBXrpState = new () => DBXrpState;
