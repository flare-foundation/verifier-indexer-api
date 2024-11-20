import { ChainType, MccCreate } from '@flarenetwork/mcc';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DBTransactionInput,
  DBTransactionInputCoinbase,
  DBTransactionOutput,
  DBUtxoIndexerBlock,
  DBUtxoTransaction,
  PruneSyncState,
  TipSyncState,
} from 'src/entity/utxo-entity-definitions';
import {
  DBXrpIndexerBlock,
  DBXrpState,
  DBXrpTransaction,
} from 'src/entity/xrp-entity-definitions';

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
      type: 'postgres', // TODO: If we ever use something other than postgres, we need to change this
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
    default:
      throw new Error(
        `Wrong verifier type: '${process.env.VERIFIER_TYPE}' provide a valid verifier type: 'doge' | 'btc' | 'xrp'`,
      );
  }
}

function getDatabaseEntities(verifierType: ChainType) {
  switch (verifierType) {
    case ChainType.BTC:
    case ChainType.DOGE:
      return [
        DBUtxoIndexerBlock,
        DBUtxoTransaction,
        DBTransactionInput,
        DBTransactionInputCoinbase,
        DBTransactionOutput,
        TipSyncState,
        PruneSyncState,
      ];
    case ChainType.XRP:
      return [DBXrpIndexerBlock, DBXrpTransaction, DBXrpState];
    default:
      throw new Error(`Unsupported verifier type: ${verifierType}`);
  }
}

export type SourceNames = 'DOGE' | 'BTC' | 'XRP';
export type AttestationTypeOptions =
  | 'AddressValidity'
  | 'BalanceDecreasingTransaction'
  | 'ConfirmedBlockHeightExists'
  | 'Payment'
  | 'ReferencedPaymentNonexistence';
