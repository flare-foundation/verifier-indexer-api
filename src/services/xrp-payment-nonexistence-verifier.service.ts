import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { VerifierType } from '../config/configuration';
import {
  AttestationResponseDTO_XRPPaymentNonexistence_Response,
  XRPPaymentNonexistence_Request,
  XRPPaymentNonexistence_Response,
} from '../dtos/attestation-types/XRPPaymentNonexistence.dto';
import { serializeBigInts } from '../external-libs/serializeBigInts';
import { verifyXRPPaymentNonexistence } from '../verification/xrp-payment-nonexistence/xrp-payment-nonexistence';
import { BaseVerifierServiceWithIndexer } from './common/verifier-base.service';
import { IConfig } from 'src/config/interfaces/common';

@Injectable()
export class XRPXRPPaymentNonexistenceVerifierService extends BaseVerifierServiceWithIndexer<
  XRPPaymentNonexistence_Request,
  XRPPaymentNonexistence_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, 'XRPPaymentNonexistence', VerifierType.XRP);
  }

  async verifyRequest(
    fixedRequest: XRPPaymentNonexistence_Request,
  ): Promise<AttestationResponseDTO_XRPPaymentNonexistence_Response> {
    const result = await verifyXRPPaymentNonexistence(
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}
