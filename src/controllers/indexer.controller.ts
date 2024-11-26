import { unPrefix0x } from '@flarenetwork/mcc';
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
import { ApiDBBlock } from 'src/dtos/indexer/ApiDbBlock.dto';
import { ApiDBState } from 'src/dtos/indexer/ApiDbState.dto';
import { ApiDBTransaction } from 'src/dtos/indexer/ApiDbTransaction.dto';
import { BlockRange } from 'src/dtos/indexer/BlockRange.dto';
import { QueryBlock, QueryBlockDetail } from 'src/dtos/indexer/QueryBlock.dto';
import {
  QueryTransaction,
  QueryTransactionDetail,
} from 'src/dtos/indexer/QueryTransaction.dto';
import { IIndexerEngineService } from 'src/services/common/base-indexer-engine-service';
import {
  BtcExternalIndexerEngineService,
  DogeExternalIndexerEngineService,
} from 'src/services/indexer-services/utxo-indexer.service';
import { XrpExternalIndexerEngineService } from 'src/services/indexer-services/xrp-indexer.service';
import {
  ApiResponseWrapper,
  handleApiResponse,
} from 'src/utils/api-models/ApiResponse';
import { PaginatedList } from 'src/utils/api-models/PaginatedList';
import {
  ApiResponseWrapperDec,
  ApiResponseWrapperPaginated,
} from 'src/utils/open-api-utils';

@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('X-API-KEY')
abstract class BaseIndexerController {
  protected abstract indexerEngine: IIndexerEngineService;

  /**
   * Gets the state entries from the indexer database.
   * @returns
   */
  @Get('state')
  @ApiResponseWrapperDec(ApiDBState, false)
  public async indexerState(): Promise<ApiResponseWrapper<ApiDBState>> {
    return handleApiResponse(this.indexerEngine.getStateSetting());
  }

  /**
   * Gets the range of available confirmed blocks in the indexer database.
   * @returns
   */
  @Get('block-range')
  @ApiResponseWrapperDec(BlockRange, false)
  public async blockRange(): Promise<ApiResponseWrapper<BlockRange>> {
    return handleApiResponse(this.indexerEngine.getBlockRange());
  }

  /**
   * Gets the indexed block height.
   * @returns
   */
  @Get('block-height-indexed')
  @ApiResponseWrapperDec(Number, false)
  public async blockHeightIndexed(): Promise<ApiResponseWrapper<number>> {
    return handleApiResponse(this.indexerEngine.getBlockHeightIndexed());
  }

  /**
   * Gets the indexed block height.
   * @returns
   */
  @Get('block-height-tip')
  @ApiResponseWrapperDec(Number, false)
  public async blockHeightTip(): Promise<ApiResponseWrapper<number>> {
    return handleApiResponse(this.indexerEngine.getBlockHeightTip());
  }

  /**
   * Gets confirmed block with the given block number.
   * Blocks that are not confirmed yet cannot be obtained using this route.
   * @param blockNumber
   * @returns
   */
  @Get('confirmed-block-at/:blockNumber')
  @ApiResponseWrapperDec(ApiDBBlock, false)
  public async confirmedBlockAt(
    @Param('blockNumber', new ParseIntPipe()) blockNumber: number,
  ): Promise<ApiResponseWrapper<ApiDBBlock>> {
    return handleApiResponse(this.indexerEngine.confirmedBlockAt(blockNumber));
  }

  /**
   * Paginated query for blocks subject to conditions from query parameters.
   * @param from Minimal block number of query range
   * @param to Maximal block number of the query range
   */
  @Get('block')
  @ApiResponseWrapperPaginated(ApiDBBlock)
  public async blockList(
    @Query() query: QueryBlock,
  ): Promise<ApiResponseWrapper<PaginatedList<ApiDBBlock>>> {
    return handleApiResponse(this.indexerEngine.listBlock(query));
  }

  /**
   * Gets a block with given hash from the indexer database.
   * @param blockHash
   */
  @Get('block/:blockHash')
  @ApiResponseWrapperDec(ApiDBBlock, false)
  public async block(
    @Param() { blockHash }: QueryBlockDetail,
  ): Promise<ApiResponseWrapper<ApiDBBlock>> {
    return handleApiResponse(
      this.indexerEngine.getBlock(blockHash.toLowerCase()),
    );
  }

  /**
   * Paginated query for confirmed transactions subject to conditions from query parameters.
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
  @ApiResponseWrapperPaginated(ApiDBTransaction)
  public async transactionsList(
    @Query() query: QueryTransaction,
  ): Promise<ApiResponseWrapper<PaginatedList<ApiDBTransaction>>> {
    return handleApiResponse(this.indexerEngine.listTransaction(query));
  }

  /**
   * Gets the transaction for a given transaction id (hash).
   * @param txHash
   * @returns
   */
  @Get('transaction/:txHash')
  @ApiResponseWrapperDec(ApiDBTransaction, false)
  public async transaction(
    @Param() { txHash }: QueryTransactionDetail,
  ): Promise<ApiResponseWrapper<ApiDBTransaction>> {
    return handleApiResponse(
      this.indexerEngine.getTransaction(unPrefix0x(txHash.toLowerCase())),
    );
  }

  /**
   * Returns block header data for the transaction with the given transaction id
   * @param txHash
   * @returns
   */
  @Get('transaction-block/:txHash')
  @ApiResponseWrapperDec(ApiDBBlock, false)
  public async transactionBlock(
    @Param() { txHash }: QueryTransactionDetail,
  ): Promise<ApiResponseWrapper<ApiDBBlock>> {
    return handleApiResponse(
      this.indexerEngine.getTransactionBlock(unPrefix0x(txHash.toLowerCase())),
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
