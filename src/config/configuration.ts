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
import { getDatabaseConfig } from './defaults/indexer-config';
import { IConfig } from './interfaces/common';
import { Web2JsonConfig, Web2JsonSource } from './interfaces/web2-json';
import { WEB2_JSON_TEST_SOURCES } from './web2/web2-json-test-sources';
import { WEB2_JSON_SOURCES } from './web2/web2-json-sources';

export default () => {
  const apiKeys = getApiKeys();
  const verifierType = extractVerifierType();
  const isTestnet = process.env.TESTNET == 'true';

  const config: IConfig = {
    port: parseInt(process.env.PORT || '3120'),
    apiKeys: apiKeys,
    isTestnet,
    verifierType,
  };

  switch (verifierType) {
    case VerifierType.BTC:
    case VerifierType.DOGE:
    case VerifierType.XRP:
      config.indexerConfig = getIndexerConfig(verifierType);
      break;
    case VerifierType.ETH:
    case VerifierType.SGB:
    case VerifierType.FLR:
    case VerifierType.BASE:
    case VerifierType.HYPE:
      config.evmRpcUrl =
        process.env.EVM_RPC || 'https://flare-api.flare.network/ext/C/rpc';
      break;
    case VerifierType.Web2:
      config.web2JsonConfig = getWeb2Config(isTestnet);
      break;
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

export function extractVerifierType(): VerifierType {
  const verifierType = process.env.VERIFIER_TYPE?.toLowerCase();
  switch (verifierType) {
    case 'doge':
      return VerifierType.DOGE;
    case 'btc':
      return VerifierType.BTC;
    case 'xrp':
      return VerifierType.XRP;
    case 'web2':
      return VerifierType.Web2;
    case 'eth':
      return VerifierType.ETH;
    case 'sgb':
      return VerifierType.SGB;
    case 'flr':
      return VerifierType.FLR;
    case 'base':
      return VerifierType.BASE;
    case 'hype':
      return VerifierType.HYPE;
    default:
      throw new Error(
        `Wrong verifier type: '${String(process.env.VERIFIER_TYPE)}' provide a valid verifier type: 'doge' | 'btc' | 'xrp' | 'web2' | 'eth' | 'sgb' | 'flr' | 'base' | 'hype'`,
      );
  }
}

export function getDatabaseEntities(verifierType: VerifierType) {
  switch (verifierType) {
    case VerifierType.BTC:
    case VerifierType.DOGE:
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
    case VerifierType.XRP:
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

function getWeb2Config(isTestnet: boolean): Web2JsonConfig {
  const selectedSourceIds = (process.env.WEB2_SOURCE_IDS ?? '')
    .split(',')
    .map((s) => s.trim());
  if (selectedSourceIds.length === 0) {
    throw new Error('WEB2_SOURCE_IDS must be set for Web2 verifier');
  }
  const allSources = isTestnet ? WEB2_JSON_TEST_SOURCES : WEB2_JSON_SOURCES;

  const sources: Web2JsonSource[] = [];
  const availableSourceIds = allSources.map((s) => s.sourceId).join(',');
  for (const sourceId of selectedSourceIds) {
    const source = allSources.find((s) => s.sourceId === sourceId);
    if (!source) {
      throw new Error(
        `Configured Web2Json source '${sourceId}' not found in available sources: ${availableSourceIds}`,
      );
    }
    // collect the source when found
    sources.push(source);
  }
  return {
    securityParams: web2JsonDefaultParams,
    sources,
  };
}

function getIndexerConfig(verifierType: VerifierType): IndexerConfig {
  const entities = getDatabaseEntities(verifierType);
  const databaseConfig = getDatabaseConfig();
  const typeOrmModulePartialOptions: TypeOrmModuleOptions = {
    ...databaseConfig,
    type: 'postgres',
    synchronize: false,
    migrationsRun: false,
    logging: false,
  };
  const typeOrmModuleOptions: TypeOrmModuleOptions = {
    ...typeOrmModulePartialOptions,
    entities,
  };
  return {
    db: databaseConfig,
    typeOrmModuleOptions,
    numberOfConfirmations: parseInt(process.env.NUMBER_OF_CONFIRMATIONS || '6'), // TODO: This should be read from db state
    indexerServerPageLimit: parseInt(
      process.env.INDEXER_SERVER_PAGE_LIMIT || '100',
    ),
  };
}

export type AttestationTypeOptions =
  | 'AddressValidity'
  | 'BalanceDecreasingTransaction'
  | 'ConfirmedBlockHeightExists'
  | 'Payment'
  | 'ReferencedPaymentNonexistence'
  | 'Web2Json'
  | 'EVMTransaction';

export enum VerifierType {
  BTC = 0,
  DOGE = 2,
  XRP = 3,
  Web2 = 4,
  ETH = 5,
  SGB = 6,
  FLR = 7,
  BASE = 8,
  HYPE = 9,
}

export function typeToSource(type: VerifierType): ChainSourceNames {
  switch (type) {
    case VerifierType.BTC:
      return 'BTC';
    case VerifierType.DOGE:
      return 'DOGE';
    case VerifierType.XRP:
      return 'XRP';
    case VerifierType.ETH:
      return 'ETH';
    case VerifierType.SGB:
      return 'SGB';
    case VerifierType.FLR:
      return 'FLR';
    case VerifierType.BASE:
      return 'BASE';
    case VerifierType.HYPE:
      return 'HYPE';
    case VerifierType.Web2:
      return 'WEB2';
  }
}

export type ChainSourceNames =
  | 'DOGE'
  | 'BTC'
  | 'XRP'
  | 'ETH'
  | 'SGB'
  | 'FLR'
  | 'BASE'
  | 'HYPE'
  | 'WEB2';
