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
import { WebJqV1_7_1Config } from './interfaces/webJqV1_7_1';
import { IndexerConfig } from './interfaces/chain-indexer';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { apiJsonDefaultConfig } from './defaults/webJqV1_7_1-config';
import {
  database,
  typeOrmModulePartialOptions,
} from './defaults/indexer-config';
import { VerifierServerConfig, IConfig } from './interfaces/common';

export default () => {
  const api_keys = process.env.API_KEYS?.split(',') || [''];
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
    verifierConfigOptions: getVerifierTypeConfigOptions(verifier_type),
    verifierConfig,
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
    case ChainType.WEB2:
      return [];
    default:
      throw new Error(`Unsupported verifier type: ${verifierType}`);
  }
}

export function getVerifierTypeConfigOptions(
  verifierType: ChainType,
): IndexerConfig | WebJqV1_7_1Config {
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
    case ChainType.WEB2:
      return apiJsonDefaultConfig;
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
  | 'WebJqV1_7_1';

export enum ChainType {
  invalid = -1,
  BTC = 0,
  DOGE = 2,
  XRP = 3,
  WEB2 = 4,
  // ... make sure IDs are the same as in Flare node
}
