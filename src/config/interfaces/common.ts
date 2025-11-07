import { ChainType } from '../configuration';
import {
  Web2JsonConfig,
} from './web2-json';
import { IndexerConfig } from './chain-indexer';

export interface IConfig {
  /** Server port (PORT) */
  port: number;
  /** Comma-separated list of API keys (API_KEYS) */
  api_keys: string[];

  isTestnet: boolean;

  verifierConfig: VerifierServerConfig;
  /** Indexer configuration for BTC, DOGE and XRP verifiers */
  indexerConfig?: IndexerConfig;
  /** Security and source configuration for Web2Json verifier */
  web2JsonConfig?: Web2JsonConfig
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
