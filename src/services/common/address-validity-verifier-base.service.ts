import {
  AddressValidity_Request,
  AddressValidity_Response,
  AddressValidity_ResponseBody,
  AttestationResponseDTO_AddressValidity_Response,
} from 'src/dtos/attestation-types/AddressValidity.dto';
import { serializeBigInts } from 'src/external-libs/utils';
import { getAttestationStatus } from 'src/verification/attestation-types/attestation-types';
import { VerificationResponse } from 'src/verification/verification-utils';
import { BaseVerifierService } from './verifier-base.service';
import {
  AttestationResponse,
  AttestationResponseStatus,
} from 'src/dtos/generic/generic.dto';

export abstract class BaseAddressValidityVerifierService extends BaseVerifierService<
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
    } as AttestationResponse<AddressValidity_Response>;
  }
}
