import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  XRPPayment_Request,
  XRPPayment_Response,
} from '../dtos/attestation-types/XRPPayment.dto';
import { XRPXRPPaymentVerifierService } from '../services/xrp-payment-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('XRPPayment')
@Controller('XRPPayment')
export class XRPXRPPaymentVerifierController extends BaseControllerFactory<
  XRPPayment_Request,
  XRPPayment_Response
>(XRPPayment_Request, XRPPayment_Response) {
  constructor(public readonly verifierService: XRPXRPPaymentVerifierService) {
    super();
  }
}
