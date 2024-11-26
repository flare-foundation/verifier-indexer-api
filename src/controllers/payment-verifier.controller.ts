import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  Payment_Request,
  Payment_Response,
} from 'src/dtos/attestation-types/Payment.dto';
import {
  BTCPaymentVerifierService,
  DOGEPaymentVerifierService,
  XRPPaymentVerifierService,
} from 'src/services/payment-verifier.service';
import {
  BaseControllerFactory
} from './base/verifier-base.controller';

@ApiTags('Payment')
@Controller('Payment')
export class DOGEPaymentVerifierController extends BaseControllerFactory<
  Payment_Request,
  Payment_Response
>(Payment_Request, Payment_Response) {
  constructor(public readonly verifierService: DOGEPaymentVerifierService) {
    super();
  }
}

@ApiTags('Payment')
@Controller('Payment')
export class BTCPaymentVerifierController extends BaseControllerFactory<
  Payment_Request,
  Payment_Response
>(Payment_Request, Payment_Response) {
  constructor(public readonly verifierService: BTCPaymentVerifierService) {
    super();
  }
}

@ApiTags('Payment')
@Controller('Payment')
export class XRPPaymentVerifierController extends BaseControllerFactory<
  Payment_Request,
  Payment_Response
>(Payment_Request, Payment_Response) {
  constructor(public readonly verifierService: XRPPaymentVerifierService) {
    super();
  }
}
