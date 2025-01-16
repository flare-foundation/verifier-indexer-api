import {
  ChainType,
  IUtxoGetTransactionRes,
  IUtxoVinTransactionCoinbase,
  IUtxoVinTransactionPrevout,
  IUtxoVoutTransaction,
} from '@flarenetwork/mcc';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApiDBBlock } from '../dtos/indexer/ApiDbBlock.dto';
import { ApiDBTransaction } from '../dtos/indexer/ApiDbTransaction.dto';
import { ApiDBVersion, IndexerVersion } from '../dtos/indexer/ApiDbVersion.dto';
import {
  BlockResult,
  TransactionResult,
} from '../indexed-query-manager/indexed-query-manager-types';

// External Postgres Database Entities (Utxo (BTC and DOGE)) (read only)

@Entity('utxo_indexer_utxoblock')
export class DBUtxoIndexerBlock {
  @PrimaryColumn({ type: 'char' })
  block_hash: string;

  @Column()
  block_number: number;

  @Column()
  timestamp: number;

  @Column()
  transactions: number;

  @Column()
  confirmed: boolean;

  @Column()
  previous_block_hash: string;

  toBlockResult(): BlockResult {
    return {
      blockNumber: this.block_number,
      blockHash: this.block_hash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      confirmed: this.confirmed,
    };
  }

  toApiDBBlock(): ApiDBBlock {
    return {
      blockNumber: this.block_number,
      blockHash: this.block_hash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      confirmed: this.confirmed,
      numberOfConfirmations: 0,
    };
  }
}

export type IDBUtxoIndexerBlock = new () => DBUtxoIndexerBlock;

@Entity('utxo_indexer_utxotransaction')
export class DBUtxoTransaction {
  @PrimaryColumn({ type: 'char' })
  transaction_id: string;

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
  transaction_type: string;

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
    const vout_arr: IUtxoVoutTransaction[] = this.transactionoutput_set
      .sort((a, b) => {
        return a.n - b.n;
      })
      .map((transaction_output) => {
        return {
          value: transaction_output.value,
          n: transaction_output.n,
          scriptPubKey: {
            address: transaction_output.script_key_address,
            asm: transaction_output.script_key_asm,
            hex: transaction_output.script_key_hex,
          },
        };
      });

    const vin_arr: IUtxoVinTransactionPrevout[] = this.transactioninput_set
      .sort((a, b) => {
        return a.vin_n - b.vin_n;
      })
      .map((transaction_inp) => {
        return {
          sequence: transaction_inp.vin_sequence,
          txid: transaction_inp.vin_previous_txid,
          vout: transaction_inp.vin_vout_index,
          prevout: {
            value: transaction_inp.value,
            scriptPubKey: {
              address: transaction_inp.script_key_address,
              asm: transaction_inp.script_key_asm,
              hex: transaction_inp.script_key_hex,
            },
          },
        };
      });

    const vin_cb_arr: IUtxoVinTransactionCoinbase[] =
      this.transactioninputcoinbase_set
        .sort((a, b) => {
          return a.vin_n - b.vin_n;
        })
        .map((transaction_inp) => {
          return {
            sequence: transaction_inp.vin_sequence,
            coinbase: transaction_inp.vin_coinbase,
          };
        });

    const res_no_vin = {
      txid: this.transaction_id,
      time: this.timestamp,
      vout: vout_arr,
      mediantime: this.timestamp,
      hash: this.transaction_id,
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
      transactionId: this.transaction_id,
      blockNumber: this.block_number,
      timestamp: this.timestamp,
      paymentReference: this.payment_reference,
      isNativePayment: this.is_native_payment,
      transactionType: this.transaction_type,
    };
  }

  toApiDBTransaction(
    chainType: ChainType,
    returnResponse: boolean = false,
  ): ApiDBTransaction {
    const baseRes = {
      id: 0,
      chainType: chainType,
      transactionId: this.transaction_id,
      blockNumber: this.block_number,
      timestamp: this.timestamp,
      paymentReference: this.payment_reference,
      isNativePayment: this.is_native_payment,
      transactionType: this.transaction_type,
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
  script_key_asm: string;

  @Column()
  script_key_hex: string;

  @Column()
  script_key_req_sigs: string;

  @Column()
  script_key_type: string;

  @Column()
  script_key_address: string;
}

@Entity('utxo_indexer_transactionoutput')
export class DBTransactionOutput extends AbstractTransactionOutput {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(
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
    (type) => DBUtxoTransaction,
    (transaction) => transaction.transactionoutput_set,
  )
  @JoinColumn({ name: 'transaction_link_id' })
  transaction_link_id: DBUtxoTransaction;

  @Column()
  vin_n: number;

  @Column()
  vin_coinbase: string;

  @Column()
  vin_sequence: number;
}

@Entity('utxo_indexer_transactioninput')
export class DBTransactionInput extends AbstractTransactionOutput {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(
    (type) => DBUtxoTransaction,
    (transaction) => transaction.transactionoutput_set,
  )
  @JoinColumn({ name: 'transaction_link_id' })
  transaction_link_id: DBUtxoTransaction;

  @Column()
  vin_n: number;

  @Column()
  vin_previous_txid: string;

  @Column()
  vin_vout_index: number;

  @Column()
  vin_sequence: number;

  @Column()
  vin_script_sig_asm: string;

  @Column()
  vin_script_sig_hex: string;
}

@Entity('utxo_indexer_tipsyncstate')
export class DBTipSyncState {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column()
  sync_state: string;

  @Column()
  latest_tip_height: number;

  @Column()
  latest_indexed_height: number;

  @Column()
  timestamp: number;

  // TODO: add sync state variables such as confirmation height, etc.
}

export type IDBTipSyncState = new () => DBTipSyncState;

@Entity('utxo_indexer_prunesyncstate')
export class DBPruneSyncState {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column()
  latest_indexed_tail_height: number;

  @Column()
  timestamp: number;
}

export type IDBPruneSyncState = new () => DBPruneSyncState;

@Entity('utxo_indexer_version')
export class DBIndexerVersion {
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

export type IDBIndexerVersion = new () => DBIndexerVersion;
