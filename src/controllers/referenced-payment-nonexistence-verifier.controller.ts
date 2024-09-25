import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
} from 'src/dtos/attestation-types/ReferencedPaymentNonexistence.dto';
import { BaseVerifierController } from './base/verifier-base.controller';
import {
  BTCReferencedPaymentNonexistenceVerifierService,
  DOGEReferencedPaymentNonexistenceVerifierService,
  XRPReferencedPaymentNonexistenceVerifierService,
} from 'src/services/referenced-payment-nonexistence-verifier.service';

@ApiTags('ReferencedPaymentNonexistence')
@Controller('ReferencedPaymentNonexistence')
export class DOGEReferencedPaymentNonexistenceVerifierController extends BaseVerifierController<
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response
> {
  constructor(
    protected readonly verifierService: DOGEReferencedPaymentNonexistenceVerifierService,
  ) {
    super();
  }
}

@ApiTags('ReferencedPaymentNonexistence')
@Controller('ReferencedPaymentNonexistence')
export class BTCReferencedPaymentNonexistenceVerifierController extends BaseVerifierController<
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response
> {
  constructor(
    protected readonly verifierService: BTCReferencedPaymentNonexistenceVerifierService,
  ) {
    super();
  }
}

@ApiTags('ReferencedPaymentNonexistence')
@Controller('ReferencedPaymentNonexistence')
export class XRPReferencedPaymentNonexistenceVerifierController extends BaseVerifierController<
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response
> {
  constructor(
    protected readonly verifierService: XRPReferencedPaymentNonexistenceVerifierService,
  ) {
    super();
  }
}
