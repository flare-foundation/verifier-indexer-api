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
import { BaseVerifierController } from './base/verifier-base.controller';

@ApiTags('Payment')
@Controller('Payment')
export class DOGEPaymentVerifierController extends BaseVerifierController<
  Payment_Request,
  Payment_Response
> {
  constructor(protected readonly verifierService: DOGEPaymentVerifierService) {
    super();
  }
}

@ApiTags('Payment')
@Controller('Payment')
export class BTCPaymentVerifierController extends BaseVerifierController<
  Payment_Request,
  Payment_Response
> {
  constructor(protected readonly verifierService: BTCPaymentVerifierService) {
    super();
  }
}

@ApiTags('Payment')
@Controller('Payment')
export class XRPPaymentVerifierController extends BaseVerifierController<
  Payment_Request,
  Payment_Response
> {
  constructor(protected readonly verifierService: XRPPaymentVerifierService) {
    super();
  }
}
