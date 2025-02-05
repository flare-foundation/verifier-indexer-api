import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DBIndexerVersion,
  DBPruneSyncState,
  DBTipSyncState,
  DBTransactionInput,
  DBTransactionInputCoinbase,
  DBTransactionOutput,
  DBUtxoIndexerBlock,
  DBUtxoTransaction,
} from '../entity/utxo-entity-definitions';
import {
  DBXrpIndexerBlock,
  DBXrpIndexerVersion,
  DBXrpState,
  DBXrpTransaction,
} from '../entity/xrp-entity-definitions';

// export type VerifierTypeOptions = 'doge' | 'btc' | 'xrp';

export interface IConfig {
  // server port (PORT)
  port: number;
  // comma separated list of API keys (API_KEYS)
  api_keys: string[];

  db: DatabaseConfig;

  verifierConfig: VerifierServerConfig;

  typeOrmModuleOptions: TypeOrmModuleOptions;

  isTestnet: boolean;
}

interface DatabaseConfig {
  /**
   * Database server address (host)
   */
  host: string; // "localhost";

  /**
   * Database name.
   */
  database: string; // "database";

  /**
   * Database server port number.
   */
  port: number; // 3306

  /**
   * Database user name.
   */
  username: string; //"username";

  /**
   * Database user password.
   */
  password: string; //"password";
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

export default () => {
  const api_keys = process.env.API_KEYS?.split(',') || [''];
  const verifier_type = extractVerifierType();
  const isTestnet = process.env.TESTNET == 'true';

  const db = {
    database: process.env.DB_DATABASE || 'database',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 8080,
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
  };

  const entities = getDatabaseEntities(verifier_type);

  const verifierConfig: VerifierServerConfig = {
    verifierType: verifier_type,
    numberOfConfirmations: parseInt(process.env.NUMBER_OF_CONFIRMATIONS || '6'), // TODO: This should be read from db state
    indexerServerPageLimit: parseInt(
      process.env.INDEXER_SERVER_PAGE_LIMIT || '100',
    ),
  };

  const config: IConfig = {
    port: parseInt(process.env.PORT || '3120'),
    api_keys,
    verifierConfig,
    db: db,
    typeOrmModuleOptions: {
      ...db,
      type: 'postgres',
      entities: entities,
      synchronize: false,
      migrationsRun: false,
      logging: false,
    },
    isTestnet,
  };
  return config;
};

export function extractVerifierType(): ChainType {
  const verifierType = process.env.VERIFIER_TYPE?.toLowerCase();
  switch (verifierType) {
    case 'doge':
      return ChainType.DOGE;
    case 'btc':
      return ChainType.BTC;
    case 'xrp':
      return ChainType.XRP;
    case 'web2':
      return ChainType.WEB2;
    default:
      throw new Error(
        `Wrong verifier type: '${process.env.VERIFIER_TYPE}' provide a valid verifier type: 'doge' | 'btc' | 'xrp'`,
      );
  }
}

export function getDatabaseEntities(verifierType: ChainType) {
  switch (verifierType) {
    case ChainType.BTC:
    case ChainType.DOGE:
      return [
        DBUtxoIndexerBlock,
        DBUtxoTransaction,
        DBTransactionInput,
        DBTransactionInputCoinbase,
        DBTransactionOutput,
        DBTipSyncState,
        DBPruneSyncState,
        DBIndexerVersion,
      ];
    case ChainType.XRP:
      return [
        DBXrpIndexerBlock,
        DBXrpTransaction,
        DBXrpState,
        DBXrpIndexerVersion,
      ];
    case ChainType.WEB2:
      return [];
    default:
      throw new Error(`Unsupported verifier type: ${verifierType}`);
  }
}

export type SourceNames = 'DOGE' | 'BTC' | 'XRP' | 'WEB2';
export type AttestationTypeOptions =
  | 'AddressValidity'
  | 'BalanceDecreasingTransaction'
  | 'ConfirmedBlockHeightExists'
  | 'Payment'
  | 'ReferencedPaymentNonexistence'
  | 'IJsonApi';

export enum ChainType {
  invalid = -1,
  BTC = 0,
  DOGE = 2,
  XRP = 3,
  WEB2 = 4,
  // ... make sure IDs are the same as in Flare node
}
