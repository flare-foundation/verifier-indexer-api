import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
} from 'src/dtos/attestation-types/ReferencedPaymentNonexistence.dto';
import {
  BTCReferencedPaymentNonexistenceVerifierService,
  DOGEReferencedPaymentNonexistenceVerifierService,
  XRPReferencedPaymentNonexistenceVerifierService,
} from 'src/services/referenced-payment-nonexistence-verifier.service';
import {
  BaseControllerFactory
} from './base/verifier-base.controller';

@ApiTags('ReferencedPaymentNonexistence')
@Controller('ReferencedPaymentNonexistence')
export class DOGEReferencedPaymentNonexistenceVerifierController extends BaseControllerFactory<
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response
>(
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
) {
  constructor(
    public readonly verifierService: DOGEReferencedPaymentNonexistenceVerifierService,
  ) {
    super();
  }
}

@ApiTags('ReferencedPaymentNonexistence')
@Controller('ReferencedPaymentNonexistence')
export class BTCReferencedPaymentNonexistenceVerifierController extends BaseControllerFactory<
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response
>(
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
) {
  constructor(
    public readonly verifierService: BTCReferencedPaymentNonexistenceVerifierService,
  ) {
    super();
  }
}

@ApiTags('ReferencedPaymentNonexistence')
@Controller('ReferencedPaymentNonexistence')
export class XRPReferencedPaymentNonexistenceVerifierController extends BaseControllerFactory<
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response
>(
  ReferencedPaymentNonexistence_Request,
  ReferencedPaymentNonexistence_Response,
) {
  constructor(
    public readonly verifierService: XRPReferencedPaymentNonexistenceVerifierService,
  ) {
    super();
  }
}
