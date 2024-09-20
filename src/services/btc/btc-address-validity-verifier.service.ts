import { Injectable } from '@nestjs/common';
import { AddressValidity_ResponseBody } from 'src/dtos/attestation-types/AddressValidity.dto';
import { verifyAddressBTC } from 'src/verification/address-validity/address-validity-btc';
import { VerificationResponse } from 'src/verification/verification-utils';
import { BaseAddressValidityVerifierService } from '../common/address-validity-verifier-base.service';

@Injectable()
export class BTCAddressValidityVerifierService extends BaseAddressValidityVerifierService {
  verifyAddress(
    address: string,
    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody> {
    return verifyAddressBTC(address, testnet);
  }
}
