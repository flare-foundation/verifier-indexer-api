import {
  BtcTransaction,
  ChainType,
  DogeTransaction,
  TransactionBase,
  XrpTransaction,
} from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from 'src/config/configuration';
import {
  AttestationResponseDTO_BalanceDecreasingTransaction_Response,
  BalanceDecreasingTransaction_Request,
  BalanceDecreasingTransaction_Response,
} from 'src/dtos/attestation-types/BalanceDecreasingTransaction.dto';
import { AttestationResponse } from 'src/dtos/generic/generic.dto';
import { serializeBigInts } from 'src/external-libs/utils';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from 'src/indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from 'src/indexed-query-manager/XrpIndexerQueryManager';
import { getAttestationStatus } from 'src/verification/attestation-types/attestation-types';
import { verifyBalanceDecreasingTransaction } from 'src/verification/generic-chain-verifications';
import { EntityManager } from 'typeorm';
import {
  BaseVerifierServiceWithIndexer,
  ITypeSpecificVerificationServiceConfig,
} from './common/verifier-base.service';

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

  async _verifyRequest<T extends TransactionBase<any>>(
    TransactionClass: new (...args: any[]) => T,
    fixedRequest: BalanceDecreasingTransaction_Request,
  ): Promise<AttestationResponseDTO_BalanceDecreasingTransaction_Response> {
    const result = await verifyBalanceDecreasingTransaction(
      TransactionClass,
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: getAttestationStatus(result.status),
      response: result.response,
    }) as AttestationResponse<BalanceDecreasingTransaction_Response>;
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
