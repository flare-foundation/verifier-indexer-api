import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AddressValidity_Request,
  AddressValidity_Response,
} from 'src/dtos/attestation-types/AddressValidity.dto';
import {
  BTCAddressValidityVerifierService,
  DOGEAddressValidityVerifierService,
  XRPAddressValidityVerifierService,
} from 'src/services/address-validity-verifier.service';
import { BaseVerifierController } from './base/verifier-base.controller';

@ApiTags('AddressValidity')
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

@ApiTags('AddressValidity')
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

@ApiTags('AddressValidity')
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
