import {
  BtcTransaction,
  ChainType,
  DogeTransaction,
  TransactionBase,
  XrpTransaction,
} from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { IConfig } from '../config/configuration';
import {
  AttestationResponseDTO_ReferencedPaymentNonexistence_Response,
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
} from '../dtos/attestation-types/ReferencedPaymentNonexistence.dto';
import { serializeBigInts } from '../external-libs/utils';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from '../indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from '../indexed-query-manager/XrpIndexerQueryManager';
import { verifyReferencedPaymentNonExistence } from '../verification/referenced-payment-nonexistence/referenced-payment-nonexistence';
import {
  BaseVerifierServiceWithIndexer,
  ITypeSpecificVerificationServiceConfig,
} from './common/verifier-base.service';

abstract class BaseReferencedPaymentNonexistenceVerifierService extends BaseVerifierServiceWithIndexer<
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    options: ITypeSpecificVerificationServiceConfig,
  ) {
    super(configService, manager, {
      ...options,
      attestationName: 'ReferencedPaymentNonexistence',
    });
  }

  async _verifyRequest<T extends TransactionBase<unknown>>(
    TransactionClass: new (...args: unknown[]) => T,
    fixedRequest: ReferencedPaymentNonexistence_Request,
  ): Promise<AttestationResponseDTO_ReferencedPaymentNonexistence_Response> {
    const result = await verifyReferencedPaymentNonExistence(
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
export class DOGEReferencedPaymentNonexistenceVerifierService extends BaseReferencedPaymentNonexistenceVerifierService {
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
    fixedRequest: ReferencedPaymentNonexistence_Request,
  ): Promise<AttestationResponseDTO_ReferencedPaymentNonexistence_Response> {
    return this._verifyRequest(DogeTransaction, fixedRequest);
  }
}

@Injectable()
export class BTCReferencedPaymentNonexistenceVerifierService extends BaseReferencedPaymentNonexistenceVerifierService {
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
    fixedRequest: ReferencedPaymentNonexistence_Request,
  ): Promise<AttestationResponseDTO_ReferencedPaymentNonexistence_Response> {
    return this._verifyRequest(BtcTransaction, fixedRequest);
  }
}

@Injectable()
export class XRPReferencedPaymentNonexistenceVerifierService extends BaseReferencedPaymentNonexistenceVerifierService {
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
    fixedRequest: ReferencedPaymentNonexistence_Request,
  ): Promise<AttestationResponseDTO_ReferencedPaymentNonexistence_Response> {
    return this._verifyRequest(XrpTransaction, fixedRequest);
  }
}
