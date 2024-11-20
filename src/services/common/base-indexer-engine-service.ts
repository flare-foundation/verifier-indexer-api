import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock.dto';
import { ApiDBState } from 'src/dtos/indexer/ApiDbState.dto';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction.dto';
import { BlockRange } from 'src/dtos/indexer/BlockRange.dto';
import { QueryBlock } from 'src/dtos/indexer/QueryBlock.dto';
import { QueryTransaction } from 'src/dtos/indexer/QueryTransaction.dto';

export abstract class IIndexerEngineService {
  public abstract getStateSetting(): Promise<ApiDBState | null>;

  public abstract getBlockRange(): Promise<BlockRange | null>;

  public abstract getBlockHeight(): Promise<number | null>;

  public abstract confirmedBlockAt(
    blockNumber: number,
  ): Promise<ApiDBBlock | null>;

  public abstract listBlock(props: QueryBlock): Promise<ApiDBBlock[]>;

  public abstract getBlock(blockHash: string): Promise<ApiDBBlock | null>;

  public abstract listTransaction(
    props: QueryTransaction,
  ): Promise<ApiDBTransaction[]>;

  public abstract getTransaction(
    txHash: string,
  ): Promise<ApiDBTransaction | null>;

  public abstract getTransactionBlock(
    txHash: string,
  ): Promise<ApiDBBlock | null>;
}
