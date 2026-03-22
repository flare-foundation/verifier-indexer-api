import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { VerifierType } from '../config/configuration';
import {
  AttestationResponseDTO_XRPPayment_Response,
  XRPPayment_Request,
  XRPPayment_Response,
} from '../dtos/attestation-types/XRPPayment.dto';
import { serializeBigInts } from '../external-libs/serializeBigInts';
import { verifyXRPPayment } from '../verification/xrp-payment/xrp-payment';
import { BaseVerifierServiceWithIndexer } from './common/verifier-base.service';
import { IConfig } from 'src/config/interfaces/common';

@Injectable()
export class XRPXRPPaymentVerifierService extends BaseVerifierServiceWithIndexer<
  XRPPayment_Request,
  XRPPayment_Response
> {
  constructor(
    protected configService: ConfigService<IConfig>,
    protected manager: EntityManager,
  ) {
    super(configService, manager, 'XRPPayment', VerifierType.XRP);
  }

  async verifyRequest(
    fixedRequest: XRPPayment_Request,
  ): Promise<AttestationResponseDTO_XRPPayment_Response> {
    const result = await verifyXRPPayment(
      fixedRequest,
      this.indexedQueryManager,
    );
    return serializeBigInts({
      status: result.status,
      response: result.response,
    });
  }
}
