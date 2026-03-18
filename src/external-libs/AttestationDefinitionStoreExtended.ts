import {
  AttestationDefinitionStore,
  decodeAttestationName,
} from '@flarenetwork/js-flare-common';
import { ParamType } from 'ethers';
import { AttestationTypeBase_Response } from '../dtos/attestation-types/AttestationTypeBase.dto';

export class AttestationDefinitionStoreExtended extends AttestationDefinitionStore {
  encodeResponse(response: AttestationTypeBase_Response): string {
    const attestationType = decodeAttestationName(response.attestationType);
    const { responseAbi } =
      this.getABIsForDecodedAttestationType(attestationType);
    return this.coder.encode([responseAbi as string | ParamType], [response]);
  }
}
