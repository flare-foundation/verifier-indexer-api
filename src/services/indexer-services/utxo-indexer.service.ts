import { ChainType, unPrefix0x } from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';

import { EntityManager, SelectQueryBuilder } from 'typeorm';

import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock.dto';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction.dto';

import { ConfigService } from '@nestjs/config';
import { IConfig, VerifierServerConfig } from 'src/config/configuration';
import { ApiDBState } from 'src/dtos/indexer/ApiDbState.dto';
import { QueryBlock } from 'src/dtos/indexer/QueryBlock.dto';
import { QueryTransaction } from 'src/dtos/indexer/QueryTransaction.dto';
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
import { IIndexerEngineService } from '../common/base-indexer-engine-service';
import { PaginatedList } from 'src/utils/api-models/PaginatedList';

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
  public async getStateSetting(): Promise<ApiDBState> {
    const queryTop = this.manager.createQueryBuilder(this.tipState, 'state');
    const resTop = await queryTop.getOne();
    if (!resTop) {
      throw new Error('No tip state found in the indexer database');
    }
    const queryPrune = this.manager.createQueryBuilder(
      this.pruneState,
      'state',
    );
    const resPrune = await queryPrune.getOne();
    if (!resPrune) {
      throw new Error('No prune state found in the indexer database');
    }
    const state: ApiDBState = {
      bottom_indexed_block: {
        height: resPrune.latestIndexedTailHeight,
        timestamp: -1, // FUTURE FEAT: (Luka) add to db
        last_updated: resPrune.timestamp,
      },
      top_indexed_block: {
        height: resTop.latestIndexedHeight,
        timestamp: -1, // FUTURE FEAT: (Luka) add to db
        last_updated: resTop.timestamp,
      },
      chain_tip_block: {
        height: resTop.latestTipHeight,
        timestamp: -1, // FUTURE FEAT: (Luka) add to db
        last_updated: resTop.timestamp,
      },
    };
    return state;
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
   * Gets a confirmed block from the indexer database in the given block number range and pagination props.
   */
  public async listBlock({ from, to }: QueryBlock): Promise<PaginatedList<ApiDBBlock>> {
    let theLimit = this.indexerServerPageLimit;
    let query = this.manager.createQueryBuilder(this.blockTable, 'block').orderBy('block.blockNumber', 'ASC');
    const count = await query.getCount();
    theLimit = Math.min(theLimit, count);

    if (from !== undefined && to !== undefined && from > to) {
      throw new Error('Invalid range, from must be less or equal than to');
    }

    if (from !== undefined) {
      query = query.andWhere('block.blockNumber >= :from', { from });
    } 
    if (to !== undefined) {
      if(from === undefined) {
        query = query.andWhere('block.blockNumber <= :to', { to }).take(theLimit);
      } else {
        const tempTo =  Math.min(to, from + theLimit - 1)
        theLimit = tempTo - from + 1;
        query = query.andWhere('block.blockNumber <= :tempTo', { tempTo });
      }
    }
    if (from === undefined && to === undefined) {
      query = query.take(theLimit);
    }
    const results = await query.getMany();
    const items = results.map((res) => {
      return res.toApiDBBlock();
    });

    return new PaginatedList(items, count, theLimit, 0);
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
    if (res) {
      return res.toApiDBBlock();
    }
    throw new Error('Block not found');
    
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
  }: QueryTransaction): Promise<PaginatedList<ApiDBTransaction>> {
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
    const count = await query.getCount();
    const results = await query.getMany();
    const items = results.map((res) => {
      return res.toApiDBTransaction(this.chainType, returnResponse);
    });

    return new PaginatedList(items, count, theLimit, theOffset);
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
