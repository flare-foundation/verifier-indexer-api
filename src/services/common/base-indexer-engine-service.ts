import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction';
import { BlockRange } from 'src/dtos/indexer/BlockRange.dto';

export interface getTransactionsWithinBlockRangeProps {
  from?: number;
  to?: number;
  paymentReference?: string;
  limit?: number;
  offset?: number;
  returnResponse?: boolean;
}

export interface IIndexerState {
  indexedBlockRange: BlockRange;
  tipHeight: number;
  lastTipUpdateTimestamp: number;
  lastTailUpdateTimestamp: number;
  state: string;
}

export abstract class IIndexerEngineService {
  public abstract getStateSetting(): Promise<IIndexerState | null>;

  public abstract getBlockRange(): Promise<BlockRange | null>;

  public abstract getTransaction(
    txHash: string,
  ): Promise<ApiDBTransaction | null>;

  public abstract getBlock(blockHash: string): Promise<ApiDBBlock | null>;

  public abstract confirmedBlockAt(
    blockNumber: number,
  ): Promise<ApiDBBlock | null>;

  public abstract getBlockHeight(): Promise<number | null>;

  public abstract getTransactionBlock(
    txHash: string,
  ): Promise<ApiDBBlock | null>;

  public abstract getTransactionsWithinBlockRange(
    props: getTransactionsWithinBlockRangeProps,
  ): Promise<ApiDBTransaction[]>;
}
