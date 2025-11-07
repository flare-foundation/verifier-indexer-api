import { ChainType } from '@flarenetwork/mcc';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AddressValidity_Request,
  AddressValidity_Response,
  AddressValidity_ResponseBody,
  AttestationResponseDTO_AddressValidity_Response,
} from '../dtos/attestation-types/AddressValidity.dto';
import { serializeBigInts } from '../external-libs/utils';
import { verifyAddressBTC } from '../verification/address-validity/address-validity-btc';
import { verifyAddressDOGE } from '../verification/address-validity/address-validity-doge';
import { verifyAddressXRP } from '../verification/address-validity/address-validity-xrp';
import { VerificationResponse } from '../verification/response-status';
import { BaseVerifierService } from './common/verifier-base.service';
import { IConfig } from 'src/config/interfaces/common';

abstract class BaseAddressValidityVerifierService extends BaseVerifierService<
  AddressValidity_Request,
  AddressValidity_Response
> {
  abstract verifyAddress(
    address: string,
    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody>;

  verifyRequest(
    fixedRequest: AddressValidity_Request,
  ): Promise<AttestationResponseDTO_AddressValidity_Response> {
    const result = this.verifyAddress(
      fixedRequest.requestBody.addressStr,
      this.isTestnet,
    );

    const status = result.status;
    const response: AddressValidity_Response = serializeBigInts({
      attestationType: fixedRequest.attestationType,
      sourceId: fixedRequest.sourceId,
      votingRound: '0',
      lowestUsedTimestamp: '0xffffffffffffffff',
      requestBody: fixedRequest.requestBody,
      responseBody: result.response,
    });

    return Promise.resolve({
      status,
      response,
    });
  }
}

@Injectable()
export class XRPAddressValidityVerifierService extends BaseAddressValidityVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, {
      chainType: ChainType.XRP,
      attestationName: 'AddressValidity',
    });
  }

  verifyAddress(
    address: string,

    testnet: boolean,
  ): VerificationResponse<AddressValidity_ResponseBody> {
    return verifyAddressXRP(address);
  }
}

@Injectable()
export class BTCAddressValidityVerifierService extends BaseAddressValidityVerifierService {
  constructor(protected configService: ConfigService<IConfig>) {
    super(configService, {
      chainType: ChainType.BTC,
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
      chainType: ChainType.DOGE,
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
