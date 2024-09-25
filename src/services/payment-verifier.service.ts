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
  AttestationResponseDTO_Payment_Response,
  Payment_Request,
  Payment_Response,
} from 'src/dtos/attestation-types/Payment.dto';
import { AttestationResponse } from 'src/dtos/generic/generic.dto';
import { serializeBigInts } from 'src/external-libs/utils';
import { getAttestationStatus } from 'src/verification/attestation-types/attestation-types';
import { verifyPayment } from 'src/verification/generic-chain-verifications';
import { EntityManager } from 'typeorm';
import { BaseVerifierServiceWithIndexer } from './common/verifier-base.service';

interface BasePaymentVerifierServiceOptions {
  source: ChainType;
  mccClient: typeof MCC.DOGE | typeof MCC.BTC | typeof MCC.XRP;
}

abstract class BasePaymentVerifierService extends BaseVerifierServiceWithIndexer<
  Payment_Request,
  Payment_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
    options: BasePaymentVerifierServiceOptions,
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
    const result = await verifyPayment(
      TransactionClass,
      fixedRequest,
      this.indexedQueryManager,
      this.client,
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
      mccClient: MCC.DOGE,
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
      mccClient: MCC.BTC,
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
      mccClient: MCC.XRP,
    });
  }

  async verifyRequest(
    fixedRequest: Payment_Request,
  ): Promise<AttestationResponseDTO_Payment_Response> {
    return this._verifyRequest(XrpTransaction, fixedRequest);
  }
}
