import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider } from 'ethers';
import { ChainSourceNames } from '../config/configuration';
import { IConfig } from '../config/interfaces/common';

abstract class BaseHealthController {
  private readonly web3Provider: JsonRpcProvider;
  private readonly evmChain: ChainSourceNames;

  protected constructor(
    configService: ConfigService<IConfig>,
    evmChain: ChainSourceNames,
  ) {
    this.evmChain = evmChain;
    const rpcUrl: string = configService.get('evmRpcUrl');
    this.web3Provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Gets the state entries from the indexer database.
   * @returns
   */
  @Get('health')
  public async indexerState(): Promise<boolean> {
    try {
      const blockNum = await this.web3Provider.getBlockNumber();
      return blockNum > 0;
    } catch (error) {
      console.error(
        `Error checking health for ${this.evmChain} node: ${error}`,
      );
      return false;
    }
  }
}

@ApiTags('Health')
@Controller('sgb/')
export class SGBHealthController extends BaseHealthController {
  constructor(configService: ConfigService<IConfig>) {
    super(configService, 'SGB');
  }
}

@ApiTags('Health')
@Controller('flr/')
export class FLRHealthController extends BaseHealthController {
  constructor(configService: ConfigService<IConfig>) {
    super(configService, 'FLR');
  }
}

@ApiTags('Health')
@Controller('eth/')
export class ETHHealthController extends BaseHealthController {
  constructor(configService: ConfigService<IConfig>) {
    super(configService, 'ETH');
  }
}
