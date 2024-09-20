import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsHash32, IsUnsignedIntLike } from '../dto-validators';
import { AttestationResponseStatus } from '../generic/generic.dto';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_AddressValidity_Response {
  constructor(
    params: Required<AttestationResponseDTO_AddressValidity_Response>,
  ) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: AddressValidity_Response;
}

export class AddressValidity_ResponseBody {
  constructor(params: Required<AddressValidity_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * Boolean indicator of the address validity.
   */
  @IsBoolean()
  @ApiProperty({
    description: `Boolean indicator of the address validity.`,
    example: true,
  })
  isValid: boolean;

  /**
   * If `isValid`, standard form of the validated address. Otherwise an empty string.
   */
  @ApiProperty({
    description: `If 'isValid', standard form of the validated address. Otherwise an empty string.`,
    example: 'Example string',
  })
  standardAddress: string;

  /**
   * If `isValid`, standard address hash of the validated address. Otherwise a zero bytes32 string.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `If 'isValid', standard address hash of the validated address. Otherwise a zero bytes32 string.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  standardAddressHash: string;
}
export class AddressValidity_RequestBody {
  constructor(params: Required<AddressValidity_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * Address to be verified.
   */
  @ApiProperty({
    description: `Address to be verified.`,
    example: 'Example string',
  })
  addressStr: string;
}
export class AddressValidity_Request {
  constructor(params: Required<AddressValidity_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
  })
  attestationType: string;

  /**
   * Id of the data source.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Id of the data source.`,
    example:
      '0x444f474500000000000000000000000000000000000000000000000000000000',
  })
  sourceId: string;

  /**
   * `MessageIntegrityCode` that is derived from the expected response.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `'MessageIntegrityCode' that is derived from the expected response.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  messageIntegrityCode: string;

  /**
   * Data defining the request. Type (struct) and interpretation is determined by the `attestationType`.
   */
  @ValidateNested()
  @Type(() => AddressValidity_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: AddressValidity_RequestBody;
}
export class AddressValidity_Response {
  constructor(params: Required<AddressValidity_Response>) {
    Object.assign(this, params);
  }

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x4164647265737356616c69646974790000000000000000000000000000000000',
  })
  attestationType: string;

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x444f474500000000000000000000000000000000000000000000000000000000',
  })
  sourceId: string;

  /**
   * The ID of the State Connector round in which the request was considered.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The ID of the State Connector round in which the request was considered.`,
    example: '123',
  })
  votingRound: string;

  /**
   * The lowest timestamp used to generate the response.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The lowest timestamp used to generate the response.`,
    example: '123',
  })
  lowestUsedTimestamp: string;

  /**
   * Extracted from the request.
   */
  @ValidateNested()
  @Type(() => AddressValidity_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: AddressValidity_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the response body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => AddressValidity_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: AddressValidity_ResponseBody;
}

export class AddressValidity_Proof {
  constructor(params: Required<AddressValidity_Proof>) {
    Object.assign(this, params);
  }

  /**
   * Merkle proof corresponding to the attestation response.
   */
  @Validate(IsHash32, { each: true })
  @ApiProperty({
    description: `Merkle proof corresponding to the attestation response.`,
    example: [
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    ],
  })
  merkleProof: string[];

  /**
   * Attestation response.
   */
  @ValidateNested()
  @Type(() => AddressValidity_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: AddressValidity_Response;
}

export class AddressValidity_RequestNoMic extends OmitType<
  AddressValidity_Request,
  'messageIntegrityCode'
>(AddressValidity_Request, ['messageIntegrityCode'] as const) {}
