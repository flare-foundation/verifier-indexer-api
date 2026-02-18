import { VerifierType } from '../configuration';
import { Web2JsonConfig } from './web2-json';
import { IndexerConfig } from './chain-indexer';

export interface IConfig {
  /** Server port (PORT) */
  port: number;
  /** Comma-separated list of API keys (API_KEYS) */
  apiKeys: string[];
  isTestnet: boolean;
  verifierType: VerifierType;
  /** Indexer configuration for BTC, DOGE and XRP verifiers */
  indexerConfig?: IndexerConfig;
  /** Security and source configuration for Web2Json verifier */
  web2JsonConfig?: Web2JsonConfig;
  evmRpcUrl?: string;
}
