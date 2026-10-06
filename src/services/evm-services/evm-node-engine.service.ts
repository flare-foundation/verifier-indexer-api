import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider } from 'ethers';
import { IConfig } from '../../config/interfaces/common';
import { ApiEvmState } from '../../dtos/evm/ApiEvmState.dto';
import { ApiEvmVersion } from '../../dtos/evm/ApiEvmVersion.dto';
import { getApiServerVersion } from '../../utils/service-version';

/**
 * Owns the RPC connection to the EVM node and exposes node state and version,
 * mirroring the role of IIndexerEngineService for indexer backed verifiers.
 */
@Injectable()
export class EvmNodeEngineService {
  private readonly logger = new Logger(EvmNodeEngineService.name);
  public readonly provider: JsonRpcProvider;

  constructor(configService: ConfigService<IConfig>) {
    const rpcUrl = configService.getOrThrow<string>('evmRpcUrl');
    this.logger.debug(`RPC host: ${new URL(rpcUrl).host}`);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Gets the chain tip as seen by the connected node.
   */
  public async getStateSetting(): Promise<ApiEvmState> {
    const block = await this.provider.getBlock('latest');
    if (!block) {
      throw new Error('Latest block not available from EVM node');
    }
    return {
      chain_tip_block: {
        height: block.number,
        timestamp: block.timestamp,
        last_updated: Math.floor(Date.now() / 1000),
      },
    };
  }

  /**
   * Gets the version of the api server and the connected node.
   */
  public async getServiceVersion(): Promise<ApiEvmVersion> {
    const [clientVersion, network, apiServer] = await Promise.all([
      this.provider.send('web3_clientVersion', []) as Promise<unknown>,
      this.provider.getNetwork(),
      getApiServerVersion(),
    ]);
    return {
      apiServer,
      nodeVersion:
        typeof clientVersion === 'string'
          ? clientVersion
          : JSON.stringify(clientVersion),
      chainId: network.chainId.toString(),
    };
  }
}
