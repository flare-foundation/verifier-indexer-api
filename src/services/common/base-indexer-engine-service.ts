import { readFile } from 'fs/promises';
import { join } from 'path';
import { ApiDBBlock } from '../../dtos/indexer/ApiDbBlock.dto';
import { ApiDBState } from '../../dtos/indexer/ApiDbState.dto';
import { ApiDBTransaction } from '../../dtos/indexer/ApiDbTransaction.dto';
import { ApiDBVersion, Version } from '../../dtos/indexer/ApiDbVersion.dto';
import { BlockRange } from '../../dtos/indexer/BlockRange.dto';
import { QueryBlock } from '../../dtos/indexer/QueryBlock.dto';
import { QueryTransaction } from '../../dtos/indexer/QueryTransaction.dto';
import { PaginatedList } from '../../utils/api-models/PaginatedList';

export abstract class IIndexerEngineService {
  public abstract getStateSetting(): Promise<ApiDBState | null>;

  public abstract getIndexerServiceVersion(): Promise<ApiDBVersion>;

  /**
   * Reads the version file from the file system.
   */
  public static async readVersionFile(
    filePath: string,
  ): Promise<string | null> {
    return readFile(join(__dirname, filePath), 'utf-8')
      .then((data) => data.trim())
      .catch((error: unknown) => {
        if (
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          return null as string;
        }
        throw error;
      });
  }

  public async getServiceVersion(): Promise<Version> {
    const [gitTag, gitHash, buildDate] = await Promise.all([
      IIndexerEngineService.readVersionFile('../../../PROJECT_VERSION'),
      IIndexerEngineService.readVersionFile('../../../PROJECT_COMMIT_HASH'),
      IIndexerEngineService.readVersionFile('../../../PROJECT_BUILD_DATE'),
    ]);
    const apiServerVersion: Version = {
      gitTag: gitTag || 'local',
      gitHash: gitHash || 'local',
      buildDate: Number(buildDate) || Math.floor(Date.now() / 1000),
    };
    return apiServerVersion;
  }

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

  public abstract listBlock(
    props: QueryBlock,
  ): Promise<PaginatedList<ApiDBBlock>>;

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
