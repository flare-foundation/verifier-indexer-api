import { ZERO_BYTES_32 } from '@flarenetwork/mcc';
import { ethers, ParamType } from 'ethers';
import {
  AttestationTypeBase_Request,
  AttestationTypeBase_Response,
} from '../dtos/attestation-types/AttestationTypeBase.dto';
import { ABIDefinitions, TypeRecord } from './config-types';
import {
  decodeAttestationName,
  DEFAULT_ATTESTATION_TYPE_CONFIGS_PATH,
  readAttestationTypeConfigs,
  remapABIParsedToObjects,
  serializeBigInts,
  structsDeepEqual,
} from './utils';

type AttestationRequestWithMic = AttestationTypeBase_Request & {
  messageIntegrityCode: string;
};

/**
 * Attestation definition store. Contains all the attestation type definitions
 * that are contained in the folder, from which the store was initialized.
 */
export class AttestationDefinitionStore {
  definitions: Map<string, TypeRecord>;
  coder: ethers.AbiCoder;

  constructor(configsPath = DEFAULT_ATTESTATION_TYPE_CONFIGS_PATH) {
    this.initialize(configsPath);
  }
  /**
   * Initializes the store by reading the attestation type definition configs from the
   * provided path.
   * @param configsPath
   */
  private initialize(configsPath: string) {
    this.definitions = readAttestationTypeConfigs(configsPath);
    this.coder = ethers.AbiCoder.defaultAbiCoder();
  }

  /**
   * Returns the attestation type definition for the provided attestation type id.
   * @param attestationType
   * @returns
   */
  getDefinitionForDecodedAttestationType(attestationType: string) {
    return this.definitions.get(attestationType);
  }

  getABIsForDecodedAttestationType(attestationTypeId: string): ABIDefinitions {
    const definition =
      this.getDefinitionForDecodedAttestationType(attestationTypeId);
    if (!definition) {
      throw new Error(
        `Unsupported attestation type id: '${attestationTypeId}'`,
      );
    }
    return {
      requestAbi: definition.requestAbi,
      responseAbi: definition.responseAbi,
      proofAbi: definition.proofAbi,
    };
  }

  /**
   * Calculated usual or salted hash of the attestation response.
   * The function throws an error if an attestation type is not supported or
   * the response does not match the provided ABI definition.
   * @param response
   * @param salt
   * @returns
   */
  attestationResponseHash<T extends AttestationTypeBase_Response>(
    response: T,
    salt?: string,
  ): string {
    const attestationType = decodeAttestationName(response.attestationType);
    const definition =
      this.getDefinitionForDecodedAttestationType(attestationType);
    if (!definition) {
      throw new Error(`Unsupported attestation type id: '${attestationType}'`);
    }
    let abiEncoded: ethers.BytesLike;
    if (salt) {
      abiEncoded = this.coder.encode(
        [definition.responseAbi as string | ParamType, 'string'],
        [response, salt],
      );
    } else {
      abiEncoded = this.coder.encode(
        [definition.responseAbi as string | ParamType],
        [response],
      );
    }
    return ethers.keccak256(abiEncoded);
  }

  /**
   * Extracts the attestation type prefix from the provided attestation request.
   * The prefix consists of 3 x 32 bytes: attestation type, source id and message integrity code.
   * The rest of the bytes define ABI encoded request body.
   * @param bytes
   * @param decodeAttestationTypeName
   * @returns
   */
  static extractPrefixFromRequest(
    bytes: string,
    decodeAttestationTypeName = false,
  ): AttestationRequestWithMic {
    if (!bytes) {
      throw new Error('Empty attestation request');
    }
    if (!bytes.match(/^0x[0-9a-fA-F]*$/)) {
      throw new Error("Not a '0x'-prefixed hex string");
    }
    if (bytes.length < 3 * 64 + 2) {
      throw new Error('Incorrectly formatted attestation request');
    }
    let attestationType = bytes.slice(0, 2 + 64);
    if (decodeAttestationTypeName) {
      attestationType = decodeAttestationName(attestationType);
    }
    return {
      attestationType,
      sourceId: '0x' + bytes.slice(2 + 64, 2 + 2 * 64),
      messageIntegrityCode: '0x' + bytes.slice(2 + 2 * 64, 2 + 3 * 64),
      requestBody: '0x' + bytes.slice(2 + 3 * 64),
    };
  }

  /**
   * Encodes attestation request.
   * The request must have the attestation type encoded into 32-byte 0x-prefixed string.
   * @param request
   * @returns
   */
  encodeRequest(request: AttestationRequestWithMic): string {
    const attestationType = decodeAttestationName(request.attestationType);
    const definition =
      this.getDefinitionForDecodedAttestationType(attestationType);
    if (!definition) {
      throw new Error(
        `Unsupported attestation type id: '${request.attestationType}'`,
      );
    }
    // custom encoding for the prefix
    const abiEncodePrefix = this.coder.encode(
      ['bytes32', 'bytes32', 'bytes32'],
      [
        request.attestationType,
        request.sourceId,
        request.messageIntegrityCode || ZERO_BYTES_32,
      ],
    );
    // ABI encoding for the request body
    if (
      !(
        typeof definition.requestAbi === 'object' &&
        'components' in definition.requestAbi &&
        definition.requestAbi.components instanceof Array
      )
    ) {
      throw new Error(`Invalid request ABI`);
    }
    const requestBodyAbi = definition.requestAbi.components.find(
      (item: ParamType) => item.name == 'requestBody',
    ) as ParamType;
    if (!requestBodyAbi) {
      throw new Error(
        `Invalid request ABI for attestation type id: '${request.attestationType}'. No 'requestBody'.`,
      );
    }
    const abiEncodeBody = this.coder.encode(
      [requestBodyAbi],
      [request.requestBody],
    );
    return ethers.concat([abiEncodePrefix, abiEncodeBody]);
  }

  encodeResponse(response: AttestationTypeBase_Response): string {
    const attestationType = decodeAttestationName(response.attestationType);
    const definition =
      this.getDefinitionForDecodedAttestationType(attestationType);
    if (!definition) {
      throw new Error(
        `Unsupported attestation type id: '${response.attestationType}'`,
      );
    }
    const abiEncode = this.coder.encode(
      [definition.responseAbi as string | ParamType],
      [response],
    );
    return abiEncode;
  }

  /**
   * Parses attestation request.
   * @param bytes
   * @returns
   */
  parseRequest<AR extends AttestationRequestWithMic>(bytes: string): AR {
    const prefix = AttestationDefinitionStore.extractPrefixFromRequest(bytes);
    const attestationType = decodeAttestationName(prefix.attestationType);
    const definition =
      this.getDefinitionForDecodedAttestationType(attestationType);
    if (!definition) {
      throw new Error(`Unsupported attestation type id: '${attestationType}'`);
    }
    if (
      !(
        typeof definition.requestAbi === 'object' &&
        'components' in definition.requestAbi &&
        definition.requestAbi.components instanceof Array
      )
    ) {
      throw new Error(`Invalid request ABI`);
    }
    const requestBodyAbi = definition.requestAbi?.components.find(
      (item: ParamType) => item.name == 'requestBody',
    ) as ParamType;
    if (!requestBodyAbi) {
      throw new Error(
        `Invalid request ABI for attestation type id: '${prefix.attestationType}'. No 'requestBody'.`,
      );
    }
    const parsed: unknown = this.coder.decode(
      [requestBodyAbi],
      '0x' + bytes.slice(2 + 3 * 64),
    )[0];
    return serializeBigInts({
      attestationType: prefix.attestationType,
      sourceId: prefix.sourceId,
      messageIntegrityCode: prefix.messageIntegrityCode,
      requestBody: remapABIParsedToObjects(parsed, requestBodyAbi),
    }) as AR;
  }

  /**
   * Compares two attestation requests.
   * @param request1
   * @param request2
   * @returns
   */
  equalsRequest(
    request1: AttestationTypeBase_Request,
    request2: AttestationTypeBase_Request,
  ): boolean {
    if (request1.attestationType !== request2.attestationType) {
      return false;
    }
    if (request1.sourceId != request2.sourceId) {
      return false;
    }
    const attestationType = decodeAttestationName(request1.attestationType);

    const requestAbi: ParamType = this.getDefinitionForDecodedAttestationType(
      attestationType,
    )?.requestAbi as ParamType;
    if (!requestAbi) {
      throw new Error(`Unsupported attestation type id: '${attestationType}'`);
    }
    return structsDeepEqual(request1, request2, requestAbi);
  }
}
