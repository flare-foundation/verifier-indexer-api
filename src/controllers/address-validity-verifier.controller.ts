import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AddressValidity_Request,
  AddressValidity_Response,
} from '../dtos/attestation-types/AddressValidity.dto';
import {
  BTCAddressValidityVerifierService,
  DOGEAddressValidityVerifierService,
  XRPAddressValidityVerifierService,
} from '../services/address-validity-verifier.service';
import { BaseControllerFactory } from './base/verifier-base.controller';

@ApiTags('AddressValidity')
@Controller('AddressValidity')
export class DOGEAddressValidityVerifierController extends BaseControllerFactory<
  AddressValidity_Request,
  AddressValidity_Response
>(AddressValidity_Request, AddressValidity_Response) {
  constructor(
    public readonly verifierService: DOGEAddressValidityVerifierService,
  ) {
    super();
  }
}

@ApiTags('AddressValidity')
@Controller('AddressValidity')
export class BTCAddressValidityVerifierController extends BaseControllerFactory<
  AddressValidity_Request,
  AddressValidity_Response
>(AddressValidity_Request, AddressValidity_Response) {
  constructor(
    public readonly verifierService: BTCAddressValidityVerifierService,
  ) {
    super();
  }
}

@ApiTags('AddressValidity')
@Controller('AddressValidity')
export class XRPAddressValidityVerifierController extends BaseControllerFactory<
  AddressValidity_Request,
  AddressValidity_Response
>(AddressValidity_Request, AddressValidity_Response) {
  constructor(
    public readonly verifierService: XRPAddressValidityVerifierService,
  ) {
    super();
  }
}
