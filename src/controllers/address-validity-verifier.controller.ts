import { Controller } from '@nestjs/common';
import {
  AddressValidity_Request,
  AddressValidity_Response,
} from 'src/dtos/attestation-types/AddressValidity.dto';
import { DOGEAddressValidityVerifierService } from 'src/services/doge/doge-address-validity-verifier.service';
import { BaseVerifierController } from './base/verifier-base.controller';
import { BTCAddressValidityVerifierService } from 'src/services/btc/btc-address-validity-verifier.service';
import { XRPAddressValidityVerifierService } from 'src/services/xrp/xrp-address-validity-verifier.service';

@Controller('AddressValidity')
export class DOGEAddressValidityVerifierController extends BaseVerifierController<
  AddressValidity_Request,
  AddressValidity_Response
> {
  constructor(
    protected readonly verifierService: DOGEAddressValidityVerifierService,
  ) {
    super();
  }
}

@Controller('AddressValidity')
export class BTCAddressValidityVerifierController extends BaseVerifierController<
  AddressValidity_Request,
  AddressValidity_Response
> {
  constructor(
    protected readonly verifierService: BTCAddressValidityVerifierService,
  ) {
    super();
  }
}

@Controller('AddressValidity')
export class XRPAddressValidityVerifierController extends BaseVerifierController<
  AddressValidity_Request,
  AddressValidity_Response
> {
  constructor(
    protected readonly verifierService: XRPAddressValidityVerifierService,
  ) {
    super();
  }
}
