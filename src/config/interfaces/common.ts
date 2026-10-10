import { VerifierType } from '../configuration';
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
  evmRpcUrl?: string;
}
