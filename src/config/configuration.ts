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
import { IndexerConfig } from './interfaces/chain-indexer';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { web2JsonDefaultParams } from './defaults/web2-json-config';
import {
  database,
  typeOrmModulePartialOptions,
} from './defaults/indexer-config';
import { IConfig, VerifierServerConfig } from './interfaces/common';
import {
  WEB2_MAINNET_SOURCES,
  WEB2_TESTNET_SOURCES,
} from './web2-json-sources';

export default () => {
  const api_keys = getApiKeys();
  const verifier_type = extractVerifierType();
  const isTestnet = process.env.TESTNET == 'true';

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
    isTestnet,
  };
  if (verifier_type === ChainType.Web2) {
    config.web2JsonConfig = {
      securityParams: web2JsonDefaultParams,
      sources: isTestnet ? WEB2_TESTNET_SOURCES : WEB2_MAINNET_SOURCES,
    };
  } else {
    config.indexerConfig = getIndexerConfig(verifier_type);
  }

  return config;
};

export function getApiKeys(): string[] {
  const raw = process.env.API_KEYS;
  if (!raw || raw.trim() === '') {
    throw new Error('API_KEYS must be set');
  }
  const apiKeys = raw
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
  if (apiKeys.length === 0) {
    throw new Error('API_KEYS contains an empty value');
  }
  return apiKeys;
}

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
      return ChainType.Web2;
    default:
      throw new Error(
        `Wrong verifier type: '${process.env.VERIFIER_TYPE}' provide a valid verifier type: 'doge' | 'btc' | 'xrp' | 'web2'`,
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
    default:
      throw new Error(`Unsupported verifier type: ${verifierType}`);
  }
}

export function getIndexerConfig(verifierType: ChainType): IndexerConfig {
  switch (verifierType) {
    case ChainType.BTC:
    case ChainType.DOGE:
    case ChainType.XRP: {
      const entities = getDatabaseEntities(verifierType);
      const typeOrmModuleOptions: TypeOrmModuleOptions = {
        ...typeOrmModulePartialOptions,
        entities,
      };
      return { db: database, typeOrmModuleOptions };
    }
    case ChainType.Web2:
      throw new Error('Web2 verifier does not use indexer config');
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
  | 'ReferencedPaymentNonexistence'
  | 'Web2Json';

export enum ChainType {
  invalid = -1,
  BTC = 0,
  DOGE = 2,
  XRP = 3,
  Web2 = 4,
  // ... make sure IDs are the same as in Flare node
}
