import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  XRPPaymentNonexistence_Request,
  XRPPaymentNonexistence_Response,
} from '../dtos/attestation-types/XRPPaymentNonexistence.dto';
import { XRPXRPPaymentNonexistenceVerifierService } from '../services/xrp-payment-nonexistence-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('XRPPaymentNonexistence')
@Controller('XRPPaymentNonexistence')
export class XRPXRPPaymentNonexistenceVerifierController extends BaseControllerFactory<
  XRPPaymentNonexistence_Request,
  XRPPaymentNonexistence_Response
>(XRPPaymentNonexistence_Request, XRPPaymentNonexistence_Response) {
  constructor(
    public readonly verifierService: XRPXRPPaymentNonexistenceVerifierService,
  ) {
    super();
  }
}
