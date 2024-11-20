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
import { IsUnsignedIntLike, IsHash32 } from '../dto-validators';
import { AttestationResponseStatus } from '../generic/generic.dto';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_ReferencedPaymentNonexistence_Response {
  constructor(
    params: Required<AttestationResponseDTO_ReferencedPaymentNonexistence_Response>,
  ) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: ReferencedPaymentNonexistence_Response;
}

export class ReferencedPaymentNonexistence_ResponseBody {
  constructor(params: Required<ReferencedPaymentNonexistence_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * The timestamp of the minimalBlock.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The timestamp of the minimalBlock.`,
    example: '123',
  })
  minimalBlockTimestamp: string;

  /**
   * The height of the firstOverflowBlock.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The height of the firstOverflowBlock.`,
    example: '123',
  })
  firstOverflowBlockNumber: string;

  /**
   * The timestamp of the firstOverflowBlock.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The timestamp of the firstOverflowBlock.`,
    example: '123',
  })
  firstOverflowBlockTimestamp: string;
}

export class ReferencedPaymentNonexistence_RequestBody {
  constructor(params: Required<ReferencedPaymentNonexistence_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * The start block of the search range.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The start block of the search range.`,
    example: '123',
  })
  minimalBlockNumber: string;

  /**
   * The blockNumber to be included in the search range.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The blockNumber to be included in the search range.`,
    example: '123',
  })
  deadlineBlockNumber: string;

  /**
   * The timestamp to be included in the search range.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The timestamp to be included in the search range.`,
    example: '123',
  })
  deadlineTimestamp: string;

  /**
   * The standard address hash of the address to which the payment had to be done.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `The standard address hash of the address to which the payment had to be done.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  destinationAddressHash: string;

  /**
   * The requested amount in minimal units that had to be payed.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The requested amount in minimal units that had to be payed.`,
    example: '123',
  })
  amount: string;

  /**
   * The requested standard payment reference.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `The requested standard payment reference.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  standardPaymentReference: string;

  /**
   * If true, the source address root is checked (only full match).
   */
  @IsBoolean()
  @ApiProperty({
    description: `If true, the source address root is checked (only full match).`,
    example:
      'true',
  })
  checkSourceAddresses: boolean;

  /**
   * The root of the Merkle tree of the source addresses.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `The root of the Merkle tree of the source addresses.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  sourceAddressesRoot: string;
}

export class ReferencedPaymentNonexistence_Request {
  constructor(params: Required<ReferencedPaymentNonexistence_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
  })
  attestationType: string;

  /**
   * ID of the data source.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the data source.`,
    example:
      '0x444f474500000000000000000000000000000000000000000000000000000000',
  })
  sourceId: string;

  /**
   * `MessageIntegrityCode` that is derived from the expected response as defined.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `'MessageIntegrityCode' that is derived from the expected response as defined.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  messageIntegrityCode: string;

  /**
   * Data defining the request. Type (struct) and interpretation is determined by the `attestationType`.
   */
  @ValidateNested()
  @Type(() => ReferencedPaymentNonexistence_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: ReferencedPaymentNonexistence_RequestBody;
}

export class ReferencedPaymentNonexistence_Response {
  constructor(params: Required<ReferencedPaymentNonexistence_Response>) {
    Object.assign(this, params);
  }

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x5265666572656e6365645061796d656e744e6f6e6578697374656e6365000000',
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
  @Type(() => ReferencedPaymentNonexistence_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: ReferencedPaymentNonexistence_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the response body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => ReferencedPaymentNonexistence_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: ReferencedPaymentNonexistence_ResponseBody;
}

export class ReferencedPaymentNonexistence_Proof {
  constructor(params: Required<ReferencedPaymentNonexistence_Proof>) {
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
  @Type(() => ReferencedPaymentNonexistence_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: ReferencedPaymentNonexistence_Response;
}

export class ReferencedPaymentNonexistence_RequestNoMic extends OmitType<
  ReferencedPaymentNonexistence_Request,
  'messageIntegrityCode'
>(ReferencedPaymentNonexistence_Request, ['messageIntegrityCode'] as const) {}
