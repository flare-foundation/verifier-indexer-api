import {
  DBUtxoIndexerBlock,
  DBUtxoTransaction,
  IDBUtxoIndexerBlock,
  IDBUtxoTransaction,
  ITipSyncState,
  TipSyncState,
} from 'src/entity/utxo-entity-definitions';
import { IIndexedQueryManager } from './IIndexedQueryManager';
import {
  BlockHeightSample,
  BlockQueryParams,
  BlockQueryResult,
  BlockResult,
  IndexedQueryManagerOptions,
  TransactionQueryParams,
  TransactionQueryResult,
} from './indexed-query-manager-types';
import { ChainType } from '@flarenetwork/mcc';

////////////////////////////////////////////////////////
// IndexedQueryManger - a class used to carry out
// queries on the indexer database such that the
// upper and lower bounds are synchronized.
////////////////////////////////////////////////////////

/**
 * A class used to carry out queries on the indexer database such that the upper and lower bounds are synchronized.
 */
abstract class UtxoIndexedQueryManager extends IIndexedQueryManager {
  // Block table entity
  private transactionTable: IDBUtxoTransaction;
  private blockTable: IDBUtxoIndexerBlock;
  private tipState: ITipSyncState;

  protected abstract chainType: ChainType;

  constructor(options: IndexedQueryManagerOptions) {
    super(options);
    this.blockTable = DBUtxoIndexerBlock;
    this.tipState = TipSyncState;
    this.transactionTable = DBUtxoTransaction;
  }

  public numberOfConfirmations(): number {
    return this.settings.numberOfConfirmations();
  }

  ////////////////////////////////////////////////////////////
  // Last confirmed blocks, tips
  ////////////////////////////////////////////////////////////

  private async _getTipStateObject(): Promise<TipSyncState> {
    const res = await this.entityManager.findOne(this.tipState, {});
    if (res === undefined || res === null) {
      throw new Error('Cant find tip sync state in DB');
    }
    return res;
  }

  public async getLastConfirmedBlockNumber(): Promise<number> {
    try {
      const tipState = await this._getTipStateObject();
      return tipState.latestIndexedHeight;
    } catch {
      return 0;
    }
  }

  public async getLatestBlockTimestamp(): Promise<BlockHeightSample | null> {
    try {
      const tipState = await this._getTipStateObject();
      return {
        height: tipState.latestTipHeight,
        timestamp: tipState.timestamp,
      };
    } catch {
      return null;
    }
  }

  ////////////////////////////////////////////////////////////
  // General confirm transaction and block queries
  ////////////////////////////////////////////////////////////

  public async queryTransactions(
    params: TransactionQueryParams,
  ): Promise<TransactionQueryResult> {
    let query = this.entityManager.createQueryBuilder(
      this.transactionTable,
      'transaction',
    );

    if (params.transactionId) {
      query = query.andWhere('transaction.transactionId = :txId', {
        txId: params.transactionId,
      });
    }

    if (params.startBlockNumber) {
      query = query.andWhere('transaction.blockNumber >= :startBlock', {
        startBlock: params.startBlockNumber,
      });
    }

    if (params.endBlockNumber) {
      query = query.andWhere('transaction.blockNumber <= :endBlock', {
        endBlock: params.endBlockNumber,
      });
    }

    if (params.paymentReference) {
      query = query.andWhere('transaction.paymentReference=:ref', {
        ref: params.paymentReference,
      });
    }

    // left join all of the inputs and outputs
    query = query.leftJoinAndSelect(
      'transaction.transactionoutput_set',
      'transactionOutput',
    );
    query = query.leftJoinAndSelect(
      'transaction.transactioninputcoinbase_set',
      'transactionInputCoinbase',
    );
    query = query.leftJoinAndSelect(
      'transaction.transactioninput_set',
      'transactionInput',
    );

    const res = await query.getMany();

    const result = res.map((val) => val.toTransactionResult(params.chainType));

    let lowerQueryWindowBlock: BlockResult;
    let upperQueryWindowBlock: BlockResult;

    if (params.startBlockNumber !== undefined) {
      const lowerQueryWindowBlockResult = await this.queryBlock({
        blockNumber: params.startBlockNumber,
        confirmed: true,
      });
      lowerQueryWindowBlock = lowerQueryWindowBlockResult.result;
    }

    if (params.endBlockNumber !== undefined) {
      const upperQueryWindowBlockResult = await this.queryBlock({
        blockNumber: params.endBlockNumber,
        confirmed: true,
      });
      upperQueryWindowBlock = upperQueryWindowBlockResult.result;
    }

    return {
      result,
      startBlock: lowerQueryWindowBlock,
      endBlock: upperQueryWindowBlock,
    };
  }

  public async queryBlock(params: BlockQueryParams): Promise<BlockQueryResult> {
    if (!params.blockNumber && !params.hash) {
      throw new Error(
        "One of 'blockNumber' or 'hash' is a mandatory parameter",
      );
    }
    let query = this.entityManager.createQueryBuilder(this.blockTable, 'block');
    if (params.confirmed) {
      query = query.andWhere('block.confirmed = :confirmed', {
        confirmed: !!params.confirmed,
      });
    }
    if (params.hash) {
      query = query.andWhere('block.blockHash = :hash', { hash: params.hash });
    } else if (params.blockNumber) {
      query = query.andWhere('block.blockNumber = :blockNumber', {
        blockNumber: params.blockNumber,
      });
    }

    const result = await query.getOne();
    if (result) {
      return {
        result: result.toBlockResult(),
      };
    }
    return {
      result: undefined,
    };
  }

  public async getBlockByHash(hash: string): Promise<BlockResult | undefined> {
    const query = this.entityManager
      .createQueryBuilder(this.blockTable, 'block')
      .where('block.blockHash = :hash', { hash: hash });
    const result = await query.getOne();
    if (result) {
      return result.toBlockResult();
    }
    return undefined;
  }

  ////////////////////////////////////////////////////////////
  // Special block queries
  ////////////////////////////////////////////////////////////

  public async getLastConfirmedBlockStrictlyBeforeTime(
    timestamp: number,
  ): Promise<BlockResult | undefined> {
    const query = this.entityManager
      .createQueryBuilder(this.blockTable, 'block')
      .where('block.confirmed = :confirmed', { confirmed: true })
      .andWhere('block.timestamp < :timestamp', { timestamp: timestamp })
      .orderBy('block.blockNumber', 'DESC')
      .limit(1);

    const res = await query.getOne();

    return res ? res.toBlockResult() : undefined;
  }

  protected async getFirstConfirmedOverflowBlock(
    timestamp: number,
    blockNumber: number,
  ): Promise<BlockResult | undefined> {
    const query = this.entityManager
      .createQueryBuilder(this.blockTable, 'block')
      .where('block.confirmed = :confirmed', { confirmed: true })
      .andWhere('block.timestamp > :timestamp', { timestamp: timestamp })
      .andWhere('block.blockNumber > :blockNumber', {
        blockNumber: blockNumber,
      })
      .orderBy('block.blockNumber', 'ASC')
      .limit(1);

    const res = await query.getOne();

    return res ? res.toBlockResult() : undefined;
  }
}

export class BtcIndexerQueryManager extends UtxoIndexedQueryManager {
  protected chainType;
  constructor(options: IndexedQueryManagerOptions) {
    super(options);
    this.chainType = ChainType.BTC;
  }
}

export class DogeIndexerQueryManager extends UtxoIndexedQueryManager {
  protected chainType;
  constructor(options: IndexedQueryManagerOptions) {
    super(options);
    this.chainType = ChainType.DOGE;
  }
}
