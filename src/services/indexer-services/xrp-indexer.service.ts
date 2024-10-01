import { ConfigService } from '@nestjs/config';
import { IConfig, VerifierServerConfig } from 'src/config/configuration';
import {
  DBXrpIndexerBlock,
  DBXrpState,
  DBXrpTransaction,
  IDBXrpIndexerBlock,
  IDBXrpState,
  IDBXrpTransaction,
} from 'src/entity/xrp-entity-definitions';
import { EntityManager } from 'typeorm';
import {
  getTransactionsWithinBlockRangeProps,
  IIndexerEngineService,
  IIndexerState,
} from '../common/base-indexer-engine-service';
import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction';
import { BlockRange } from 'src/dtos/indexer/BlockRange.dto';
import { unPrefix0x } from '@flarenetwork/mcc';

export class XrpExternalIndexerEngineService extends IIndexerEngineService {
  // External utxo indexers specific tables
  private transactionTable: IDBXrpTransaction;
  private blockTable: IDBXrpIndexerBlock;
  private tipState: IDBXrpState;

  private indexerServerPageLimit: number;

  constructor(
    private configService: ConfigService<IConfig>,
    private manager: EntityManager,
  ) {
    super();
    this.transactionTable = DBXrpTransaction;
    this.blockTable = DBXrpIndexerBlock;
    this.tipState = DBXrpState;
    const verifierConfig =
      this.configService.get<VerifierServerConfig>('verifierConfig');
    this.indexerServerPageLimit = verifierConfig.indexerServerPageLimit;
  }

  public getStateSetting(): Promise<IIndexerState | null> {
    throw new Error('Method not implemented.');
  }

  public async getBlockRange(): Promise<BlockRange | null> {
    const query = this.manager
      .createQueryBuilder(this.transactionTable, 'transaction')
      .select('MAX(transaction.block_number)', 'max')
      .addSelect('MIN(transaction.block_number)', 'min');
    const res = await query.getRawOne();
    if (res) {
      return {
        first: res.min,
        last: res.max,
      };
    }
    return null;
  }

  public async getTransaction(
    txHash: string,
  ): Promise<ApiDBTransaction | null> {
    const query = this.manager
      .createQueryBuilder(this.transactionTable, 'transaction')
      .andWhere('transaction.transaction_id = :txHash', { txHash });
    const res = await query.getOne();
    if (res) {
      return res.toApiDBTransaction();
    }
  }

  public async getBlock(blockHash: string): Promise<ApiDBBlock | null> {
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .andWhere('block.hash = :blockHash', { blockHash });
    const res = await query.getOne();
    if (res) {
      return res.toApiDBBlock();
    }
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
  }

  public async getBlockHeight(): Promise<number | null> {
    const query = this.manager
      .createQueryBuilder(this.blockTable, 'block')
      .orderBy('block.block_number', 'DESC')
      .limit(1);
    const res = await query.getOne();
    if (res === null) {
      return null;
    }
    return res.block_number;
  }

  public async getTransactionBlock(txHash: string): Promise<ApiDBBlock | null> {
    const tx = await this.getTransaction(txHash);
    if (!tx) {
      return null;
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
  }

  public async getTransactionsWithinBlockRange({
    from,
    to,
    paymentReference,
    limit,
    offset,
    returnResponse,
  }: getTransactionsWithinBlockRangeProps): Promise<ApiDBTransaction[]> {
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
      .addOrderBy('transaction.transaction_id', 'ASC')
      .limit(theLimit)
      .offset(theOffset);
    const results = await query.getMany();
    return results.map((res) => {
      return res.toApiDBTransaction(returnResponse);
    });
  }
}
