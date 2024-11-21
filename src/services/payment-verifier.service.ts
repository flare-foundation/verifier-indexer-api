import {
  BtcTransaction,
  ChainType,
  DogeTransaction,
  TransactionBase,
  XrpTransaction,
} from '@flarenetwork/mcc';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from 'src/config/configuration';
import {
  AttestationResponseDTO_Payment_Response,
  Payment_Request,
  Payment_Response,
} from 'src/dtos/attestation-types/Payment.dto';
import { AttestationResponse } from 'src/dtos/generic/generic.dto';
import { serializeBigInts } from 'src/external-libs/utils';
import {
  BtcIndexerQueryManager,
  DogeIndexerQueryManager,
} from 'src/indexed-query-manager/UtxoIndexQueryManager';
import { XrpIndexerQueryManager } from 'src/indexed-query-manager/XrpIndexerQueryManager';
import { getAttestationStatus } from 'src/verification/attestation-types/attestation-types';
import { verifyPayment } from 'src/verification/generic-chain-verifications';
import { EntityManager } from 'typeorm';
import {
  BaseVerifierServiceWithIndexer,
  ITypeSpecificVerificationServiceConfig,
} from './common/verifier-base.service';

abstract class BasePaymentVerifierService extends BaseVerifierServiceWithIndexer<
  Payment_Request,
  Payment_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    options: ITypeSpecificVerificationServiceConfig,
  ) {
    super(configService, manager, {
      ...options,
      attestationName: 'Payment',
    });
  }

  async _verifyRequest<T extends TransactionBase<any>>(
    TransactionClass: new (...args: any[]) => T,
    fixedRequest: Payment_Request,
  ): Promise<AttestationResponseDTO_Payment_Response> {
    Logger.debug("Verifying Payment Attestation");
    Logger.debug(fixedRequest);
    const result = await verifyPayment(
      TransactionClass,
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: getAttestationStatus(result.status),
      response: result.response,
    }) as AttestationResponse<Payment_Response>;
  }
}

@Injectable()
export class DOGEPaymentVerifierService extends BasePaymentVerifierService {
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
    fixedRequest: Payment_Request,
  ): Promise<AttestationResponseDTO_Payment_Response> {
    return this._verifyRequest(DogeTransaction, fixedRequest);
  }
}

@Injectable()
export class BTCPaymentVerifierService extends BasePaymentVerifierService {
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
    fixedRequest: Payment_Request,
  ): Promise<AttestationResponseDTO_Payment_Response> {
    return this._verifyRequest(BtcTransaction, fixedRequest);
  }
}

@Injectable()
export class XRPPaymentVerifierService extends BasePaymentVerifierService {
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
    fixedRequest: Payment_Request,
  ): Promise<AttestationResponseDTO_Payment_Response> {
    return this._verifyRequest(XrpTransaction, fixedRequest);
  }
}
