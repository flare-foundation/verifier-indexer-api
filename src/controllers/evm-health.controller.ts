import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEvmState } from '../dtos/evm/ApiEvmState.dto';
import { ApiEvmVersion } from '../dtos/evm/ApiEvmVersion.dto';
import { EvmNodeEngineService } from '../services/evm-services/evm-node-engine.service';
import {
  ApiResponseWrapper,
  handleApiResponse,
} from '../utils/api-models/ApiResponse';
import { ApiResponseWrapperDec } from '../utils/open-api-utils';

@ApiTags('Health')
@Controller('api/')
export class EVMHealthController {
  constructor(private readonly nodeEngine: EvmNodeEngineService) {}

  /**
   * Gets the chain tip as seen by the connected EVM node.
   * @returns
   */
  @Get('health')
  @ApiResponseWrapperDec(ApiEvmState, false)
  public async nodeState(): Promise<ApiResponseWrapper<ApiEvmState>> {
    return handleApiResponse(this.nodeEngine.getStateSetting());
  }

  /**
   * Gets the version of the api server and the connected EVM node.
   * @returns
   */
  @Get('version')
  @ApiResponseWrapperDec(ApiEvmVersion, false)
  public async nodeVersion(): Promise<ApiResponseWrapper<ApiEvmVersion>> {
    return handleApiResponse(this.nodeEngine.getServiceVersion());
  }
}

@ApiTags('Health')
@Controller('api/')
export class ARBHealthController extends BaseHealthController {
  constructor(configService: ConfigService<IConfig>) {
    super(configService, 'ARB');
  }
}
