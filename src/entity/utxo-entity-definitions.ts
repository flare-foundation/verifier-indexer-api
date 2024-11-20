import {
  ChainType,
  IUtxoGetTransactionRes,
  IUtxoVinTransactionCoinbase,
  IUtxoVinTransactionPrevout,
  IUtxoVoutTransaction,
} from '@flarenetwork/mcc';
import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock.dto';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction.dto';
import {
  BlockResult,
  TransactionResult,
} from 'src/indexed-query-manager/indexed-query-manager-types';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

// External Postgres Database Entities (Utxo (BTC and DOGE)) (read only)

@Entity('utxo_indexer_utxoblock')
export class DBUtxoIndexerBlock {
  @PrimaryColumn({ type: 'char' })
  blockHash: string;

  @Column()
  blockNumber: number;

  @Column()
  timestamp: number;

  @Column()
  transactions: number;

  @Column()
  confirmed: boolean;

  @Column()
  previousBlockHash: string;

  toBlockResult(): BlockResult {
    return {
      blockNumber: this.blockNumber,
      blockHash: this.blockHash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      confirmed: this.confirmed,
    };
  }

  toApiDBBlock(): ApiDBBlock {
    return {
      blockNumber: this.blockNumber,
      blockHash: this.blockHash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      confirmed: this.confirmed,
      numberOfConfirmations: 0,
      previousBlockHash: this.previousBlockHash,
    };
  }
}

export type IDBUtxoIndexerBlock = new () => DBUtxoIndexerBlock;

@Entity('utxo_indexer_utxotransaction')
export class DBUtxoTransaction {
  @PrimaryColumn({ type: 'char' })
  transactionId: string;

  @Column()
  blockNumber: number;

  @Column()
  timestamp: number;

  @Column()
  paymentReference: string;

  @Column()
  isNativePayment: boolean;

  @Column()
  transactionType: string;

  @OneToMany(() => DBTransactionOutput, (output) => output.transaction_link_id)
  transactionoutput_set: DBTransactionOutput[];

  @OneToMany(
    () => DBTransactionInputCoinbase,
    (cb_input) => cb_input.transaction_link_id,
  )
  transactioninputcoinbase_set: DBTransactionInputCoinbase[];

  @OneToMany(() => DBTransactionInput, (input) => input.transaction_link_id)
  transactioninput_set: DBTransactionInput[];

  // Transaction methods
  private get response(): IUtxoGetTransactionRes {
    const vout_arr: IUtxoVoutTransaction[] = this.transactionoutput_set.map(
      (transaction_output) => {
        return {
          value: transaction_output.value,
          n: transaction_output.n,
          scriptPubKey: {
            address: transaction_output.scriptKeyAddress,
            asm: transaction_output.scriptKeyAsm,
            hex: transaction_output.scriptKeyHex,
          },
        };
      },
    );

    const vin_arr: IUtxoVinTransactionPrevout[] = this.transactioninput_set
      .sort((a, b) => {
        return a.vinN - b.vinN;
      })
      .map((transaction_inp) => {
        return {
          sequence: transaction_inp.vinSequence,
          txid: transaction_inp.vinPreviousTxid,
          vout: transaction_inp.vinVoutIndex,
          prevout: {
            value: transaction_inp.value,
            scriptPubKey: {
              address: transaction_inp.scriptKeyAddress,
              asm: transaction_inp.scriptKeyAsm,
              hex: transaction_inp.scriptKeyHex,
            },
          },
        };
      });

    const vin_cb_arr: IUtxoVinTransactionCoinbase[] =
      this.transactioninputcoinbase_set
        .sort((a, b) => {
          return a.vinN - b.vinN;
        })
        .map((transaction_inp) => {
          return {
            sequence: transaction_inp.vinSequence,
            coinbase: transaction_inp.vinCoinbase,
          };
        });

    const res_no_vin = {
      txid: this.transactionId,
      time: this.timestamp,
      vout: vout_arr,
      blocktime: this.timestamp,
      hash: this.transactionId,
      version: 1,
      size: 0,
      vsize: 0,
      weight: 0,
      locktime: 0,
      hex: '',
      blockhash: '',
      confirmations: 0,
    };

    if (vin_cb_arr.length > 0) {
      return {
        ...res_no_vin,
        vin: vin_cb_arr,
      };
    }

    return {
      ...res_no_vin,
      vin: vin_arr,
    };
  }

  toTransactionResult(chainType: ChainType): TransactionResult {
    const response = JSON.stringify(this.response);
    return {
      getResponse() {
        return response;
      },
      chainType: chainType,
      transactionId: this.transactionId,
      blockNumber: this.blockNumber,
      timestamp: this.timestamp,
      paymentReference: this.paymentReference,
      isNativePayment: this.isNativePayment,
      transactionType: this.transactionType,
    };
  }

  toApiDBTransaction(
    chainType: ChainType,
    returnResponse: boolean = false,
  ): ApiDBTransaction {
    const baseRes = {
      id: 0,
      chainType: chainType,
      transactionId: this.transactionId,
      blockNumber: this.blockNumber,
      timestamp: this.timestamp,
      paymentReference: this.paymentReference,
      isNativePayment: this.isNativePayment,
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

export type IDBUtxoTransaction = new () => DBUtxoTransaction;

abstract class AbstractTransactionOutput {
  @Column()
  n: number;

  @Column()
  value: string;

  @Column()
  scriptKeyAsm: string;

  @Column()
  scriptKeyHex: string;

  @Column()
  scriptKeyReqSigs: string;

  @Column()
  scriptKeyType: string;

  @Column()
  scriptKeyAddress: string;
}

@Entity('utxo_indexer_transactionoutput')
export class DBTransactionOutput extends AbstractTransactionOutput {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (type) => DBUtxoTransaction,
    (transaction) => transaction.transactionoutput_set,
  )
  @JoinColumn({ name: 'transaction_link_id' })
  transaction_link_id: DBUtxoTransaction;
}

@Entity('utxo_indexer_transactioninputcoinbase')
export class DBTransactionInputCoinbase {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (type) => DBUtxoTransaction,
    (transaction) => transaction.transactionoutput_set,
  )
  @JoinColumn({ name: 'transaction_link_id' })
  transaction_link_id: DBUtxoTransaction;

  @Column()
  vinN: number;

  @Column()
  vinCoinbase: string;

  @Column()
  vinSequence: number;
}

@Entity('utxo_indexer_transactioninput')
export class DBTransactionInput extends AbstractTransactionOutput {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (type) => DBUtxoTransaction,
    (transaction) => transaction.transactionoutput_set,
  )
  @JoinColumn({ name: 'transaction_link_id' })
  transaction_link_id: DBUtxoTransaction;

  @Column()
  vinN: number;

  @Column()
  vinPreviousTxid: string;

  @Column()
  vinVoutIndex: number;

  @Column()
  vinSequence: number;

  @Column()
  vinScriptSigAsm: string;

  @Column()
  vinScriptSigHex: string;
}

@Entity('utxo_indexer_tipsyncstate')
export class TipSyncState {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column()
  syncState: string;

  @Column()
  latestTipHeight: number;

  @Column()
  latestIndexedHeight: number;

  @Column()
  timestamp: number;

  // TODO: add sync state variables such as confirmation height, etc.
}

export type ITipSyncState = new () => TipSyncState;

@Entity('utxo_indexer_prunesyncstate')
export class PruneSyncState {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column()
  latestIndexedTailHeight: number;

  @Column()
  timestamp: number;
}

export type IPruneSyncState = new () => PruneSyncState;
