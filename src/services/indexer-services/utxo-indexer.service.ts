import { ChainType, unPrefix0x } from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';

import { EntityManager, SelectQueryBuilder } from 'typeorm';

import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction';
import { BlockRange } from 'src/dtos/indexer/BlockRange.dto';

import { ConfigService } from '@nestjs/config';
import { IConfig, VerifierServerConfig } from 'src/config/configuration';
import {
  DBUtxoIndexerBlock,
  DBUtxoTransaction,
  IDBUtxoIndexerBlock,
  IDBUtxoTransaction,
  IPruneSyncState,
  ITipSyncState,
  PruneSyncState,
  TipSyncState,
} from 'src/entity/utxo-entity-definitions';
import {
  IIndexerEngineService,
  IIndexerState,
} from '../common/base-indexer-engine-service';
import {
  QueryBlock,
  QueryTransaction,
} from 'src/dtos/indexer/QueryTransaction.dto';

abstract class UtxoExternalIndexerEngineService extends IIndexerEngineService {
  // External utxo indexers specific tables
  private transactionTable: IDBUtxoTransaction;
  private blockTable: IDBUtxoIndexerBlock;
  private tipState: ITipSyncState;
  private pruneState: IPruneSyncState;

  private indexerServerPageLimit: number;

  protected abstract chainType: ChainType;

  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super();
    this.blockTable = DBUtxoIndexerBlock;
    this.transactionTable = DBUtxoTransaction;
    this.tipState = TipSyncState;
    this.pruneState = PruneSyncState;
    const verifierConfig =
      this.configService.get<VerifierServerConfig>('verifierConfig');
    this.indexerServerPageLimit = verifierConfig.indexerServerPageLimit;
  }

  private joinTransactionQuery(query: SelectQueryBuilder<DBUtxoTransaction>) {
    return query
      .leftJoinAndSelect(
        'transaction.transactionoutput_set',
        'transactionOutput',
      )
      .leftJoinAndSelect(
        'transaction.transactioninputcoinbase_set',
        'transactionInputCoinbase',
      )
      .leftJoinAndSelect(
        'transaction.transactioninput_set',
        'transactionInput',
      );
  }

  /**
   * Gets the state entries from the indexer database.
   * @returns
   */
  public async getStateSetting(): Promise<IIndexerState> {
    const queryTop = this.manager.createQueryBuilder(this.tipState, 'state');
    const res = await queryTop.getOne();
    const queryPrune = this.manager.createQueryBuilder(
      this.pruneState,
      'state',
    );
    const resPrune = await queryPrune.getOne();
    const state = {
      indexedBlockRange: {
        first: resPrune.latestIndexedTailHeight,
        last: res.latestIndexedHeight,
      },
      tipHeight: res.latestTipHeight,
      lastTipUpdateTimestamp: res.timestamp,
      lastTailUpdateTimestamp: resPrune.timestamp,
      state: res.syncState,
    };
    return state;
  }

  /**
   * Gets the range of available confirmed blocks in the indexer database.
   * @returns
   */
  public async getBlockRange(): Promise<BlockRange | null> {
    const query = this.manager
      .createQueryBuilder(this.transactionTable, 'transaction')
      .select('MAX(transaction.blockNumber)', 'max')
      .addSelect('MIN(transaction.blockNumber)', 'min');
    const res = await query.getRawOne();
    if (res) {
      return {
        first: res.min,
        last: res.max,
      };
    }
    return null;
  }

  /**
   * Gets the confirmed transaction from the indexer database for a given transaction id (hash).
   * @param txHash
   * @returns
   */
  public async getTransaction(
    txHash: string,
  ): Promise<ApiDBTransaction> | null {
    const query = this.joinTransactionQuery(
      this.manager
        .createQueryBuilder(this.transactionTable, 'transaction')
        .andWhere('transaction.transactionId = :txHash', { txHash }),
    );
    const res = await query.getOne();
    if (res === null) {
      return null;
    }
    return res.toApiDBTransaction(this.chainType, true);
  }

  /**
   * Gets a block header data from the indexer database for a given block hash.
   * @param blockHash
   * @returns
   */
  public async getBlock(blockHash: string): Promise<ApiDBBlock | null> {
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .andWhere('block.blockHash = :blockHash', { blockHash });
    const res = await query.getOne();
    if (res === null) {
      return null;
    }
    return res.toApiDBBlock();
  }

  /**
   * Gets a block in the indexer database with the given block number. Note that some chains may have blocks in multiple forks on the same height.
   * @param blockNumber
   * @returns
   */
  public async confirmedBlockAt(
    blockNumber: number,
  ): Promise<ApiDBBlock | null> {
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .andWhere('block.blockNumber = :blockNumber', { blockNumber });
    const res = await query.getOne();
    if (res === null) {
      return null;
    }
    return res.toApiDBBlock();
  }

  /**
   * Get the height of the last observed block in the indexer database.
   */
  public async getBlockHeight(): Promise<number> | null {
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .orderBy('block.blockNumber', 'DESC')
      .limit(1);
    const res = await query.getOne();
    if (res === null) {
      return null;
    }
    return res.blockNumber;
  }

  /**
   * Get the block header data of the confirmed transaction in the database
   * for the given transaction id.
   * @param txHash
   * @returns
   */
  public async getTransactionBlock(txHash: string): Promise<ApiDBBlock> | null {
    const tx = await this.getTransaction(txHash);
    if (tx) {
      const block = await this.confirmedBlockAt(tx.blockNumber);
      if (block === null) {
        return null;
      }
      return block;
    }
    return null;
  }

  /**
   * Gets a confirmed transaction from the indexer database in the given block number range. and pagination props
   */
  public async listTransaction({
    from,
    to,
    paymentReference,
    limit,
    offset,
    returnResponse,
  }: QueryTransaction): Promise<ApiDBTransaction[]> {
    if (paymentReference) {
      if (!/^0x[0-9a-f]{64}$/i.test(paymentReference)) {
        throw new Error('Invalid payment reference');
      }
    }

    let theLimit = limit ?? this.indexerServerPageLimit;
    theLimit = Math.min(theLimit, this.indexerServerPageLimit);
    const theOffset = offset ?? 0;

    let query = this.manager.createQueryBuilder(
      this.transactionTable,
      'transaction',
    );
    if (from !== undefined) {
      query = query.andWhere('transaction.blockNumber >= :from', { from });
    }
    if (to !== undefined) {
      query = query.andWhere('transaction.blockNumber <= :to', { to });
    }
    if (paymentReference) {
      query = query.andWhere('transaction.paymentReference = :reference', {
        reference: unPrefix0x(paymentReference),
      });
    }
    query = query
      .orderBy('transaction.blockNumber', 'ASC')
      .addOrderBy('transaction.transactionId', 'ASC')
      .limit(theLimit)
      .offset(theOffset);
    if (returnResponse) {
      query = this.joinTransactionQuery(query);
    }
    const results = await query.getMany();
    return results.map((res) => {
      return res.toApiDBTransaction(this.chainType, returnResponse);
    });
  }

  /**
   * Gets a confirmed block from the indexer database in the given block number range and pagination props.
   */
  public async listBlock({
    from,
    to,
    limit,
    offset,
  }: QueryBlock): Promise<ApiDBBlock[]> {
    let theLimit = limit ?? this.indexerServerPageLimit;
    theLimit = Math.min(theLimit, this.indexerServerPageLimit);
    const theOffset = offset ?? 0;

    let query = this.manager.createQueryBuilder(this.blockTable, 'block');
    if (from !== undefined) {
      query = query.andWhere('block.blockNumber >= :from', { from });
    }
    if (to !== undefined) {
      query = query.andWhere('block.blockNumber <= :to', { to });
    }
    query = query
      .orderBy('block.blockNumber', 'ASC')
      .limit(theLimit)
      .offset(theOffset);
    const results = await query.getMany();
    return results.map((res) => {
      return res.toApiDBBlock();
    });
  }
}

@Injectable()
export class BtcExternalIndexerEngineService extends UtxoExternalIndexerEngineService {
  protected chainType;
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager);
    this.chainType = ChainType.BTC;
  }
}

@Injectable()
export class DogeExternalIndexerEngineService extends UtxoExternalIndexerEngineService {
  protected chainType;
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager);
    this.chainType = ChainType.DOGE;
  }
}
