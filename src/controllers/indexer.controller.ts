import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/apikey.guard';
import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction';
import { BlockRange } from 'src/dtos/indexer/BlockRange.dto';
import { QueryTransaction } from 'src/dtos/indexer/QueryTransaction.dto';
import {
  IIndexerEngineService,
  IIndexerState,
} from 'src/services/common/base-indexer-engine-service';
import {
  BtcExternalIndexerEngineService,
  DogeExternalIndexerEngineService,
} from 'src/services/indexer-services/utxo-indexer.service';
import { XrpExternalIndexerEngineService } from 'src/services/indexer-services/xrp-indexer.service';
import {
  ApiResponseWrapper,
  handleApiResponse,
} from 'src/utils/api-models/ApiResponse';

@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('X-API-KEY')
abstract class BaseIndexerController {
  protected abstract indexerEngine: IIndexerEngineService;

  /**
   * Gets the state entries from the indexer database.
   * @returns
   */
  @Get('state')
  public async indexerState(): Promise<ApiResponseWrapper<IIndexerState>> {
    return handleApiResponse(this.indexerEngine.getStateSetting());
  }

  /**
   * Gets the range of available confirmed blocks in the indexer database.
   * @returns
   */
  @Get('block-range')
  public async blockRange(): Promise<ApiResponseWrapper<BlockRange | null>> {
    return handleApiResponse(this.indexerEngine.getBlockRange());
  }

  /**
   * Gets the transaction for a given transaction id (hash).
   * @param txHash
   * @returns
   */
  @Get('transaction/:txHash')
  public async transaction(
    @Param('txHash') txHash: string,
  ): Promise<ApiResponseWrapper<ApiDBTransaction>> {
    return handleApiResponse(
      this.indexerEngine.getTransaction(txHash.toLowerCase()),
    );
  }

  /**
   * Gets a block with given hash from the indexer database.
   * @param blockHash
   * @returns
   */
  @Get('block/:blockHash')
  public async block(
    @Param('blockHash') blockHash: string,
  ): Promise<ApiResponseWrapper<ApiDBBlock>> {
    return handleApiResponse(
      this.indexerEngine.getBlock(blockHash.toLowerCase()),
    );
  }

  /**
   * Gets confirmed block with the given block number.
   * Blocks that are not confirmed yet cannot be obtained using this route.
   * @param blockNumber
   * @returns
   */
  @Get('confirmed-block-at/:blockNumber')
  public async confirmedBlockAt(
    @Param('blockNumber', new ParseIntPipe()) blockNumber: number,
  ): Promise<ApiResponseWrapper<ApiDBBlock>> {
    return handleApiResponse(this.indexerEngine.confirmedBlockAt(blockNumber));
  }

  /**
   * Gets the indexed block height.
   * @returns
   */
  @Get('block-height')
  public async blockHeight(): Promise<ApiResponseWrapper<number>> {
    return handleApiResponse(this.indexerEngine.getBlockHeight());
  }

  /**
   * Returns block header data for the transaction with the given transaction id
   * @param txHash
   * @returns
   */
  @Get('transaction-block/:txHash')
  public async transactionBlock(
    @Param('txHash') txHash: string,
  ): Promise<ApiResponseWrapper<ApiDBBlock>> {
    return handleApiResponse(
      this.indexerEngine.getTransactionBlock(txHash.toLowerCase()),
    );
  }

  /**
   * Paged query for confirmed transactions subject to conditions from query parameters.
   * Transactions are sorted first by block number and then by transaction id.
   * @param from Minimal block number of query range
   * @param to Maximal block number of the query range
   * @param paymentReference 0x-prefixed lowercase hex string representing 32-bytes
   * @param limit Query limit. Capped by server config settings
   * @param offset Query offset
   * @param returnResponse Whether response from node stored in the indexer database should be returned
   * @returns
   */

  @Get('transaction')
  public async transactionsWithinBlockRange(
    @Query() query: QueryTransaction,
  ): Promise<ApiResponseWrapper<ApiDBTransaction[]>> {
    return handleApiResponse(
      this.indexerEngine.getTransactionsWithinBlockRange(query),
    );
  }
}

@ApiTags('Indexer')
@Controller('api/indexer')
export class BTCIndexerController extends BaseIndexerController {
  constructor(protected indexerEngine: BtcExternalIndexerEngineService) {
    super();
  }
}

@ApiTags('Indexer')
@Controller('api/indexer')
export class DOGEIndexerController extends BaseIndexerController {
  constructor(protected indexerEngine: DogeExternalIndexerEngineService) {
    super();
  }
}

@ApiTags('Indexer')
@Controller('api/indexer')
export class XrpIndexerController extends BaseIndexerController {
  constructor(protected indexerEngine: XrpExternalIndexerEngineService) {
    super();
  }
}
