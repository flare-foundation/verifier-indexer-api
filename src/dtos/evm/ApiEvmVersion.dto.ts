import { Version } from '../indexer/ApiDbVersion.dto';

/**
 * Version entries of an EVM verifier
 */
export class ApiEvmVersion {
  /**
   * Version of api server
   */
  apiServer: Version;

  /**
   * Version of connected underlying node (web3_clientVersion)
   */
  nodeVersion: string;

  /**
   * Chain id reported by the connected node
   */
  chainId: string;
}
