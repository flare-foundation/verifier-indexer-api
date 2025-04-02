import { unPrefix0x } from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { ApiDBBlock } from '../../dtos/indexer/ApiDbBlock.dto';
import { ApiDBState } from '../../dtos/indexer/ApiDbState.dto';
import { ApiDBTransaction } from '../../dtos/indexer/ApiDbTransaction.dto';
import { ApiDBVersion } from '../../dtos/indexer/ApiDbVersion.dto';
import { QueryBlock } from '../../dtos/indexer/QueryBlock.dto';
import { QueryTransaction } from '../../dtos/indexer/QueryTransaction.dto';
import {
  DBXrpIndexerBlock,
  DBXrpIndexerVersion,
  DBXrpState,
  DBXrpTransaction,
  IDBXrpIndexerBlock,
  IDBXrpIndexerVersion,
  IDBXrpState,
  IDBXrpTransaction,
} from '../../entity/xrp-entity-definitions';
import { PaginatedList } from '../../utils/api-models/PaginatedList';
import { IIndexerEngineService } from '../common/base-indexer-engine-service';
import { IConfig, VerifierServerConfig } from 'src/config/interfaces/common';

@Injectable()
export class XrpExternalIndexerEngineService extends IIndexerEngineService {
  // External utxo indexers specific tables
  private transactionTable: IDBXrpTransaction;
  private blockTable: IDBXrpIndexerBlock;
  private tipState: IDBXrpState;
  private versionTable: IDBXrpIndexerVersion;

  private indexerServerPageLimit: number;

  constructor(
    private configService: ConfigService<IConfig>,
    private manager: EntityManager,
  ) {
    super();
    this.transactionTable = DBXrpTransaction;
    this.blockTable = DBXrpIndexerBlock;
    this.tipState = DBXrpState;
    this.versionTable = DBXrpIndexerVersion;
    const verifierConfig =
      this.configService.get<VerifierServerConfig>('verifierConfig');
    this.indexerServerPageLimit = verifierConfig.indexerServerPageLimit;
  }

  public async getStateSetting(): Promise<ApiDBState> {
    const query = this.manager.createQueryBuilder(this.tipState, 'states');
    const res = await query.getOne();
    if (!res) {
      throw new Error('No state setting found in the database XRP');
    }
    const response: ApiDBState = {
      bottom_indexed_block: {
        height: res.first_indexed_block_number,
        timestamp: res.first_indexed_block_timestamp,
        last_updated: res.last_history_drop,
      },
      top_indexed_block: {
        height: res.last_indexed_block_number,
        timestamp: res.last_indexed_block_timestamp,
        last_updated: res.last_indexed_block_updated,
      },
      chain_tip_block: {
        height: res.last_chain_block_number,
        timestamp: res.last_chain_block_timestamp,
        last_updated: res.last_chain_block_updated,
      },
    };
    return response;
  }

  /**
   * Gets the version of the indexer service.
   */
  public async getIndexerServiceVersion(): Promise<ApiDBVersion> {
    const queryVersion = this.manager.createQueryBuilder(
      this.versionTable,
      'version',
    );

    const resVersion = await queryVersion.getOne();
    if (!resVersion) {
      throw new Error('No versions state found in the indexer database');
    }

    const nodeVersion = resVersion.toNodeVersion();
    const indexerVersion = resVersion.toIndexerVersion();
    const apiServerVersion = await this.getServiceVersion();

    return {
      nodeVersion,
      indexer: indexerVersion,
      apiServer: apiServerVersion,
    };
  }

  public async confirmedBlockAt(
    blockNumber: number,
  ): Promise<ApiDBBlock | null> {
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .andWhere('block.block_number = :blockNumber', { blockNumber });
    const res = await query.getOne();
    if (res) {
      return res.toApiDBBlock();
    }
    throw new Error('Block not found');
  }

  public async listBlock({
    from,
    to,
  }: QueryBlock): Promise<PaginatedList<ApiDBBlock>> {
    // TODO: (Luka) add pagination
    let theLimit = this.indexerServerPageLimit;
    let query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .orderBy('block.block_number', 'ASC');
    const count = await query.getCount();
    theLimit = Math.min(theLimit, count);

    if (from !== undefined && to !== undefined && from > to) {
      throw new Error('Invalid range, from must be less or equal than to');
    }

    if (from !== undefined) {
      query = query.andWhere('block.block_number >= :from', { from });
    }
    if (to !== undefined) {
      if (from === undefined) {
        query = query
          .andWhere('block.block_number <= :to', { to })
          .take(theLimit);
      } else {
        const tempTo = Math.min(to, from + theLimit - 1);
        theLimit = tempTo - from + 1;
        query = query.andWhere('block.block_number <= :tempTo', { tempTo });
      }
    }
    if (from === undefined && to === undefined) {
      query = query.take(theLimit);
    }
    const results = await query.getMany();
    const items = results.map((res) => {
      return res.toApiDBBlock();
    });

    return new PaginatedList(items, theLimit, 0);
  }

  public async getBlock(blockHash: string): Promise<ApiDBBlock> {
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .andWhere('block.hash = :blockHash', { blockHash });
    const res = await query.getOne();
    if (res) {
      return res.toApiDBBlock();
    }
    throw new Error('Block not found');
  }

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
      query = query.andWhere('transaction.block_number >= :from', { from });
    }
    if (to !== undefined) {
      query = query.andWhere('transaction.block_number <= :to', { to });
    }
    if (paymentReference) {
      query = query.andWhere('transaction.payment_reference = :reference', {
        reference: unPrefix0x(paymentReference),
      });
    }
    query = query
      .orderBy('transaction.block_number', 'ASC')
      .addOrderBy('transaction.hash', 'ASC')
      .limit(theLimit)
      .offset(theOffset);

    const results = await query.getMany();
    const items = results.map((res) => {
      return res.toApiDBTransaction(returnResponse);
    });

    return new PaginatedList(items, theLimit, theOffset);
  }

  public async getTransaction(txHash: string): Promise<ApiDBTransaction> {
    const query = this.manager
      .createQueryBuilder(this.transactionTable, 'transaction')
      .andWhere('transaction.hash = :txHash', { txHash });
    const res = await query.getOne();
    if (res) {
      return res.toApiDBTransaction(true);
    }
    throw new Error('Transaction not found');
  }

  public async getTransactionBlock(txHash: string): Promise<ApiDBBlock | null> {
    const tx = await this.getTransaction(txHash);
    if (!tx) {
      throw new Error('Transaction not found');
    }
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .andWhere('block.block_number = :blockNumber', {
        blockNumber: tx.blockNumber,
      });
    const res = await query.getOne();
    if (res) {
      return res.toApiDBBlock();
    }
    throw new Error('Block not found');
  }
}
