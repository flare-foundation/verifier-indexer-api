import {
  BtcTransaction,
  DogeTransaction,
  TransactionBase,
  XrpTransaction,
} from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { ChainType } from '../config/configuration';
import {
  AttestationResponseDTO_BalanceDecreasingTransaction_Response,
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
} from '../dtos/attestation-types/BalanceDecreasingTransaction.dto';
import { serializeBigInts } from '../external-libs/utils';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from '../indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from '../indexed-query-manager/XrpIndexerQueryManager';

import { verifyBalanceDecreasingTransaction } from '../verification/balance-decreasing-transaction/balance-decreasing-transaction';
import {
  BaseVerifierServiceWithIndexer,
  ITypeSpecificVerificationServiceConfig,
} from './common/verifier-base.service';
import { IConfig } from 'src/config/interfaces/common';

abstract class BaseBalanceDecreasingTransactionVerifierService extends BaseVerifierServiceWithIndexer<
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    options: ITypeSpecificVerificationServiceConfig,
  ) {
    super(configService, manager, {
      ...options,
      attestationName: 'BalanceDecreasingTransaction',
    });
  }

  async _verifyRequest<T extends TransactionBase<unknown>>(
    TransactionClass: new (...args: unknown[]) => T,
    fixedRequest: BalanceDecreasingTransaction_Request,
  ): Promise<AttestationResponseDTO_BalanceDecreasingTransaction_Response> {
    const result = await verifyBalanceDecreasingTransaction(
      TransactionClass,
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}

@Injectable()
export class DOGEBalanceDecreasingTransactionVerifierService extends BaseBalanceDecreasingTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, {
      source: ChainType.DOGE,
      indexerQueryManager: DogeIndexerQueryManager,
    });
  }

  async verifyRequest(
    fixedRequest: BalanceDecreasingTransaction_Request,
  ): Promise<AttestationResponseDTO_BalanceDecreasingTransaction_Response> {
    return this._verifyRequest(DogeTransaction, fixedRequest);
  }
}

@Injectable()
export class BTCBalanceDecreasingTransactionVerifierService extends BaseBalanceDecreasingTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, {
      source: ChainType.BTC,
      indexerQueryManager: BtcIndexerQueryManager,
    });
  }

  async verifyRequest(
    fixedRequest: BalanceDecreasingTransaction_Request,
  ): Promise<AttestationResponseDTO_BalanceDecreasingTransaction_Response> {
    return this._verifyRequest(BtcTransaction, fixedRequest);
  }
}

@Injectable()
export class XRPBalanceDecreasingTransactionVerifierService extends BaseBalanceDecreasingTransactionVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, {
      source: ChainType.XRP,
      indexerQueryManager: XrpIndexerQueryManager,
    });
  }

  async verifyRequest(
    fixedRequest: BalanceDecreasingTransaction_Request,
  ): Promise<AttestationResponseDTO_BalanceDecreasingTransaction_Response> {
    return this._verifyRequest(XrpTransaction, fixedRequest);
  }
}
