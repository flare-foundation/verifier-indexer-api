import {
  BtcTransaction,
  DogeTransaction,
  TransactionBase,
  XrpTransaction,
} from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import {
  AttestationResponseDTO_BalanceDecreasingTransaction_Response,
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
} from '../dtos/attestation-types/BalanceDecreasingTransaction.dto';
import { serializeBigInts } from '../external-libs/utils';

import { verifyBalanceDecreasingTransaction } from '../verification/balance-decreasing-transaction/balance-decreasing-transaction';
import { BaseVerifierServiceWithIndexer } from './common/verifier-base.service';
import { IConfig } from 'src/config/interfaces/common';
import { VerifierType } from '../config/configuration';

abstract class BaseBalanceDecreasingTransactionVerifierService extends BaseVerifierServiceWithIndexer<
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response
> {
  protected constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    verifierType: VerifierType,
  ) {
    super(configService, manager, 'BalanceDecreasingTransaction', verifierType);
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
    super(configService, manager, VerifierType.DOGE);
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
    super(configService, manager, VerifierType.BTC);
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
    super(configService, manager, VerifierType.XRP);
  }

  async verifyRequest(
    fixedRequest: BalanceDecreasingTransaction_Request,
  ): Promise<AttestationResponseDTO_BalanceDecreasingTransaction_Response> {
    return this._verifyRequest(XrpTransaction, fixedRequest);
  }
}
