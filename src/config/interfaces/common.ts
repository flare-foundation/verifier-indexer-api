import { ChainType } from '../configuration';
import { WebJqV1_7_1Config } from './webJqV1_7_1';
import { IndexerConfig } from './chain-indexer';

export interface IConfig {
  // server port (PORT)
  port: number;
  // comma separated list of API keys (API_KEYS)
  api_keys: string[];

  verifierConfigOptions: IndexerConfig | WebJqV1_7_1Config;

  verifierConfig: VerifierServerConfig;

  isTestnet: boolean;
}

export interface VerifierServerConfig {
  verifierType: ChainType;

  /**
   * The page size for indexer API queries when listing outputs
   */
  indexerServerPageLimit: number;

  /**
   * The number of confirmations required for a transaction to be considered confirmed
   */
  numberOfConfirmations: number;
}
