import { Controller, Get } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiDBState } from '../dtos/indexer/ApiDbState.dto';
import { IIndexerEngineService } from '../services/common/base-indexer-engine-service';
import {
  BtcExternalIndexerEngineService,
  DogeExternalIndexerEngineService,
} from '../services/indexer-services/utxo-indexer.service';
import { XrpExternalIndexerEngineService } from '../services/indexer-services/xrp-indexer.service';
import {
  ApiResponseWrapper,
  handleApiResponse,
} from '../utils/api-models/ApiResponse';
import { ApiResponseWrapperDec } from '../utils/open-api-utils';
import { ApiDBVersion } from '../dtos/indexer/ApiDbVersion.dto';

abstract class BaseHealthController {
  protected abstract indexerEngine: IIndexerEngineService;

  /**
   * Gets the state entries from the indexer database.
   * @returns
   */
  @Get('health')
  @ApiResponseWrapperDec(ApiDBState, false)
  public async indexerState(): Promise<ApiResponseWrapper<ApiDBState>> {
    return handleApiResponse(this.indexerEngine.getStateSetting());
  }

  /**
   * Gets the version of the indexer service.
   * @returns
   */
  @Get('version')
  @ApiResponseWrapperDec(ApiDBVersion, false)
  public async indexerVersion(): Promise<ApiResponseWrapper<ApiDBVersion>> {
    return handleApiResponse(this.indexerEngine.getIndexerServiceVersion());
  }

}

@ApiTags('Health')
@Controller('api/')
export class BTCHealthController extends BaseHealthController {
  constructor(protected indexerEngine: BtcExternalIndexerEngineService) {
    super();
  }
}

@ApiTags('Health')
@Controller('api/')
export class DOGEHealthController extends BaseHealthController {
  constructor(protected indexerEngine: DogeExternalIndexerEngineService) {
    super();
  }
}

@ApiTags('Health')
@Controller('api/')
export class XRPHealthController extends BaseHealthController {
  constructor(protected indexerEngine: XrpExternalIndexerEngineService) {
    super();
  }
}
