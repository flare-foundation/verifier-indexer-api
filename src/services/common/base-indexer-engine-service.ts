import { ApiDBVersion } from 'src/dtos/indexer/ApiDbVersion.dto';
import { ApiDBBlock } from '../../dtos/indexer/ApiDbBlock.dto';
import { ApiDBState } from '../../dtos/indexer/ApiDbState.dto';
import { ApiDBTransaction } from '../../dtos/indexer/ApiDbTransaction.dto';
import { BlockRange } from '../../dtos/indexer/BlockRange.dto';
import { QueryBlock } from '../../dtos/indexer/QueryBlock.dto';
import { QueryTransaction } from '../../dtos/indexer/QueryTransaction.dto';
import { PaginatedList } from '../../utils/api-models/PaginatedList';

export abstract class IIndexerEngineService {
  public abstract getStateSetting(): Promise<ApiDBState | null>;

  public abstract getIndexerServiceVersion(): Promise<ApiDBVersion>

  /**
   * Gets the range of available confirmed blocks in the indexer database.
   * @returns
   */
  public async getBlockRange(): Promise<BlockRange> {
    const state = await this.getStateSetting();
    return {
      first: state.bottom_indexed_block.height,
      last: state.top_indexed_block.height,
      tip: state.chain_tip_block.height,
    };
  }

  /**
   * Get the height of the last observed block in the indexer database.
   */
  public async getBlockHeightIndexed(): Promise<number> {
    const state = await this.getStateSetting();
    return state.top_indexed_block.height;
  }

  /**
   * Get the height of the last observed block in the indexer database.
   */
  public async getBlockHeightTip(): Promise<number> {
    const state = await this.getStateSetting();
    return state.chain_tip_block.height;
  }

  public abstract confirmedBlockAt(
    blockNumber: number,
  ): Promise<ApiDBBlock | null>;

  public abstract listBlock(props: QueryBlock): Promise<PaginatedList<ApiDBBlock>>;

  public abstract getBlock(blockHash: string): Promise<ApiDBBlock>;

  public abstract listTransaction(
    props: QueryTransaction,
  ): Promise<PaginatedList<ApiDBTransaction>>;

  public abstract getTransaction(
    txHash: string,
  ): Promise<ApiDBTransaction | null>;

  public abstract getTransactionBlock(
    txHash: string,
  ): Promise<ApiDBBlock | null>;
}
