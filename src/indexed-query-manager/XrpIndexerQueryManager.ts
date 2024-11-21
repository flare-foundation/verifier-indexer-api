import {
  DBXrpIndexerBlock,
  DBXrpState,
  DBXrpTransaction,
  IDBXrpIndexerBlock,
  IDBXrpState,
  IDBXrpTransaction,
} from 'src/entity/xrp-entity-definitions';
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

type XrpStateTypes =
  | 'first_database_block'
  | 'last_database_block'
  | 'last_chain_block';

/**
 * Class for Verifier server implementation (FDC)
 */
export class XrpIndexerQueryManager extends IIndexedQueryManager {
  // Block table entity
  private transactionTable: IDBXrpTransaction;
  private blockTable: IDBXrpIndexerBlock;
  private tipState: IDBXrpState;

  constructor(options: IndexedQueryManagerOptions) {
    super(options);
    this.transactionTable = DBXrpTransaction;
    this.blockTable = DBXrpIndexerBlock;
    this.tipState = DBXrpState;
  }

  public numberOfConfirmations(): number {
    return this.settings.numberOfConfirmations();
  }

  private async _getStateObject(): Promise<DBXrpState> {
    const query = this.entityManager
      .createQueryBuilder(this.tipState, 'state')
    return query.getOne();
  }

  public async getLastConfirmedBlockNumber(): Promise<number> {
    const stateEntry = await this._getStateObject();
    return stateEntry.last_indexed_block_number;
  }

  public async getLatestBlockTimestamp(): Promise<BlockHeightSample | null> {
    const stateEntry = await this._getStateObject();
    return {
      height: stateEntry.last_chain_block_number,
      timestamp: stateEntry.last_chain_block_timestamp,
    };
  }

  public async queryTransactions(
    params: TransactionQueryParams,
  ): Promise<TransactionQueryResult> {
    let query = this.entityManager.createQueryBuilder(
      this.transactionTable,
      'transaction',
    );

    if (params.startBlockNumber) {
      query = query.andWhere('transaction.block_number >= :startBlock', {
        startBlock: params.startBlockNumber,
      });
    }

    if (params.endBlockNumber) {
      query = query.andWhere('transaction.block_number <= :endBlock', {
        endBlock: params.endBlockNumber,
      });
    }

    if (params.paymentReference) {
      query = query.andWhere('transaction.payment_reference=:ref', {
        ref: params.paymentReference.toLowerCase(),
      });
    }

    if (params.sourceAddressRoot) {
      query = query.andWhere('transaction.source_addresses_root=:root', {
        root: params.sourceAddressRoot.toLowerCase(),
      });
    }

    if (params.transactionId) {
      query = query.andWhere('transaction.hash = :txId', {
        txId: params.transactionId.toLowerCase(),
      });
    }

    const res = await query.getMany();

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
      result: res.map((t) => t.toTransactionResult()),
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
    // if (params.confirmed) {
    //   continue;
    // }
    if (params.hash) {
      query = query.andWhere('block.hash = :hash', { hash: params.hash });
    } else if (params.blockNumber) {
      query = query.andWhere('block.block_number = :blockNumber', {
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
    const queryResult = await this.queryBlock({ hash });
    return queryResult.result;
  }

  public async getLastConfirmedBlockStrictlyBeforeTime(
    timestamp: number,
  ): Promise<BlockResult | undefined> {
    const query = this.entityManager
      .createQueryBuilder(this.blockTable, 'block')
      .andWhere('block.timestamp < :timestamp', { timestamp: timestamp })
      .orderBy('block.block_number', 'DESC')
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
      .andWhere('block.timestamp > :timestamp', { timestamp: timestamp })
      .andWhere('block.block_number > :blockNumber', {
        blockNumber: blockNumber,
      })
      .orderBy('block.block_number', 'ASC')
      .limit(1);

    const res = await query.getOne();

    return res ? res.toBlockResult() : undefined;
  }
}
