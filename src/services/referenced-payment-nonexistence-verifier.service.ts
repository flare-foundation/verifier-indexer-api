import {
  BtcTransaction,
  ChainType,
  DogeTransaction,
  MCC,
  TransactionBase,
  XrpTransaction,
} from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from 'src/config/configuration';
import {
  AttestationResponseDTO_ReferencedPaymentNonexistence_Response,
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
} from 'src/dtos/attestation-types/ReferencedPaymentNonexistence.dto';
import { AttestationResponse } from 'src/dtos/generic/generic.dto';
import { serializeBigInts } from 'src/external-libs/utils';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from 'src/indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from 'src/indexed-query-manager/XrpIndexerQueryManager';
import { getAttestationStatus } from 'src/verification/attestation-types/attestation-types';
import { verifyReferencedPaymentNonExistence } from 'src/verification/generic-chain-verifications';
import { EntityManager } from 'typeorm';
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

  async _verifyRequest<T extends TransactionBase<any>>(
    TransactionClass: new (...args: any[]) => T,
    fixedRequest: ReferencedPaymentNonexistence_Request,
  ): Promise<AttestationResponseDTO_ReferencedPaymentNonexistence_Response> {
    const result = await verifyReferencedPaymentNonExistence(
      TransactionClass,
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: getAttestationStatus(result.status),
      response: result.response,
    }) as AttestationResponse<ReferencedPaymentNonexistence_Response>;
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
      mccClient: MCC.DOGE,
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
      mccClient: MCC.BTC,
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
      mccClient: MCC.XRP,
      indexerQueryManager: XrpIndexerQueryManager,
    });
  }

  async verifyRequest(
    fixedRequest: ReferencedPaymentNonexistence_Request,
  ): Promise<AttestationResponseDTO_ReferencedPaymentNonexistence_Response> {
    return this._verifyRequest(XrpTransaction, fixedRequest);
  }
}
