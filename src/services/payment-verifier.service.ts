import {
  BtcTransaction,
  DogeTransaction,
  TransactionBase,
  XrpTransaction,
} from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { VerifierType } from '../config/configuration';
import {
  AttestationResponseDTO_Payment_Response,
  Payment_Request,
  Payment_Response,
} from '../dtos/attestation-types/Payment.dto';
import { serializeBigInts } from '../external-libs/serializeBigInts';

import { verifyPayment } from '../verification/payment/payment';
import { BaseVerifierServiceWithIndexer } from './common/verifier-base.service';
import { IConfig } from 'src/config/interfaces/common';

abstract class BasePaymentVerifierService extends BaseVerifierServiceWithIndexer<
  Payment_Request,
  Payment_Response
> {
  protected constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    verifierType: VerifierType,
  ) {
    super(configService, manager, 'Payment', verifierType);
  }

  async _verifyRequest<T extends TransactionBase<unknown>>(
    TransactionClass: new (...args: unknown[]) => T,
    fixedRequest: Payment_Request,
  ): Promise<AttestationResponseDTO_Payment_Response> {
    const result = await verifyPayment(
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
export class DOGEPaymentVerifierService extends BasePaymentVerifierService {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, VerifierType.DOGE);
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
    super(configService, manager, VerifierType.BTC);
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
    super(configService, manager, VerifierType.XRP);
  }

  async verifyRequest(
    fixedRequest: Payment_Request,
  ): Promise<AttestationResponseDTO_Payment_Response> {
    return this._verifyRequest(XrpTransaction, fixedRequest);
  }
}
