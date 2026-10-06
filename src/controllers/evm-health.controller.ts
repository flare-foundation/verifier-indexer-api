import { Controller, Get, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(EVMHealthController.name);

  constructor(private readonly nodeEngine: EvmNodeEngineService) {}

  /**
   * Executes `call` and logs its error, but only propagates a generic error to not
   * expose potentially sensitive internal details.
   * @param what names the operation in the log line, for example `health`
   * @param call the operation whose failure must not reach the caller in detail
   */
  private async withPublicError<T>(what: string, call: Promise<T>): Promise<T> {
    try {
      return await call;
    } catch (error) {
      this.logger.error(`${what} failed: ${String(error)}`);
      throw new Error('EVM node unavailable');
    }
  }

  /**
   * Gets the chain tip as seen by the connected EVM node.
   */
  @Get('health')
  @ApiResponseWrapperDec(ApiEvmState, false)
  public async nodeState(): Promise<ApiResponseWrapper<ApiEvmState>> {
    return handleApiResponse(
      this.withPublicError('health', this.nodeEngine.getStateSetting()),
    );
  }

  /**
   * Gets the version of the api server and the connected EVM node.
   */
  @Get('version')
  @ApiResponseWrapperDec(ApiEvmVersion, false)
  public async nodeVersion(): Promise<ApiResponseWrapper<ApiEvmVersion>> {
    return handleApiResponse(
      this.withPublicError('version', this.nodeEngine.getServiceVersion()),
    );
  }
}
