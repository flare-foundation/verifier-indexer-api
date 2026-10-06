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
import { getDatabaseConfig } from './defaults/indexer-config';
import { getPositiveIntEnv } from './env';
import { IConfig } from './interfaces/common';

export default () => {
  const apiKeys = getApiKeys();
  const verifierType = extractVerifierType();
  const isTestnet = process.env.TESTNET == 'true';

  const config: IConfig = {
    port: getPositiveIntEnv('PORT', 3120),
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
    case VerifierType.ARB:
      config.evmRpcUrl =
        process.env.EVM_RPC || 'https://flare-api.flare.network/ext/C/rpc';
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
    case 'arb':
      return VerifierType.ARB;
    default:
      throw new Error(
        `Wrong verifier type: '${verifierType}' provide a valid verifier type: 'doge' | 'btc' | 'xrp' | 'eth' | 'sgb' | 'flr' | 'base' | 'hype' | 'arb'`,
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
    numberOfConfirmations: getPositiveIntEnv('NUMBER_OF_CONFIRMATIONS', 6), // TODO: This should be read from db state
    indexerServerPageLimit: getPositiveIntEnv('INDEXER_SERVER_PAGE_LIMIT', 100),
  };
}

export type AttestationTypeOptions =
  | 'AddressValidity'
  | 'BalanceDecreasingTransaction'
  | 'ConfirmedBlockHeightExists'
  | 'Payment'
  | 'ReferencedPaymentNonexistence'
  | 'EVMTransaction'
  | 'XRPPayment'
  | 'XRPPaymentNonexistence';

export enum VerifierType {
  BTC = 0,
  DOGE = 2,
  XRP = 3,
  ETH = 5,
  SGB = 6,
  FLR = 7,
  BASE = 8,
  HYPE = 9,
  ARB = 10,
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
    case VerifierType.ARB:
      return 'ARB';
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
  | 'ARB';
