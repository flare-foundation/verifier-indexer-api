import { Injectable } from '@nestjs/common';
import { AddressValidity_ResponseBody } from 'src/dtos/attestation-types/AddressValidity.dto';
import { verifyAddressXRP } from 'src/verification/address-validity/address-validity-xrp';
import { VerificationResponse } from 'src/verification/verification-utils';
import { BaseAddressValidityVerifierService } from '../common/address-validity-verifier-base.service';

@Injectable()
export class XRPAddressValidityVerifierService extends BaseAddressValidityVerifierService {
  verifyAddress(
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody> {
    return verifyAddressXRP(address);
  }
}
