import { ChainType } from '@flarenetwork/mcc';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from 'src/config/configuration';
import {
  AddressValidity_Request,
  AddressValidity_Response,
  AddressValidity_ResponseBody,
  AttestationResponseDTO_AddressValidity_Response,
} from 'src/dtos/attestation-types/AddressValidity.dto';
import {
  AttestationResponse,
  AttestationResponseStatus,
} from 'src/dtos/generic/generic.dto';
import { serializeBigInts } from 'src/external-libs/utils';
import { verifyAddressBTC } from 'src/verification/address-validity/address-validity-btc';
import { verifyAddressDOGE } from 'src/verification/address-validity/address-validity-doge';
import { verifyAddressXRP } from 'src/verification/address-validity/address-validity-xrp';
import { getAttestationStatus } from 'src/verification/attestation-types/attestation-types';
import { VerificationResponse } from 'src/verification/verification-utils';
import { BaseVerifierService } from './common/verifier-base.service';

abstract class BaseAddressValidityVerifierService extends BaseVerifierService<
  AddressValidity_Request,
  AddressValidity_Response
> {
  abstract verifyAddress(
    address: string,
    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody>;

  async verifyRequest(
    fixedRequest: AddressValidity_Request,
  ): Promise<AttestationResponseDTO_AddressValidity_Response> {
    const result = this.verifyAddress(
      fixedRequest.requestBody.addressStr,
      this.isTestnet,
    );

    const status = getAttestationStatus(result.status);
    if (status != AttestationResponseStatus.VALID) return { status };

    const response: AddressValidity_Response = serializeBigInts({
      attestationType: fixedRequest.attestationType,
      sourceId: fixedRequest.sourceId,
      votingRound: '0',
      lowestUsedTimestamp: '0xffffffffffffffff',
      requestBody: fixedRequest.requestBody,
      responseBody: result.response,
    });

    return {
      status,
      response,
    };
  }
}

@Injectable()
export class XRPAddressValidityVerifierService extends BaseAddressValidityVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, {
      source: ChainType.XRP,
      attestationName: 'AddressValidity',
    });
  }

  verifyAddress(
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody> {
    return verifyAddressXRP(address);
  }
}

@Injectable()
export class BTCAddressValidityVerifierService extends BaseAddressValidityVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, {
      source: ChainType.BTC,
      attestationName: 'AddressValidity',
    });
  }

  verifyAddress(
    address: string,
    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody> {
    return verifyAddressBTC(address, testnet);
  }
}

@Injectable()
export class DOGEAddressValidityVerifierService extends BaseAddressValidityVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, {
      source: ChainType.DOGE,
      attestationName: 'AddressValidity',
    });
  }

  verifyAddress(
    address: string,
    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody> {
    return verifyAddressDOGE(address, testnet);
  }
}
