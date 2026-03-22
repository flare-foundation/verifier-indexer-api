import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  Validate,
  ValidateNested,
} from 'class-validator';
import { AttestationResponseStatus } from '../../verification/response-status';
import { transformHash32 } from '../dto-transform-utils';
import { IsEVMAddress, IsHash32, IsUnsignedIntLike } from '../dto-validators';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_XRPPaymentNonexistence_Response {
  constructor(
    params: Required<AttestationResponseDTO_XRPPaymentNonexistence_Response>,
  ) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: XRPPaymentNonexistence_Response;
}

export class XRPPaymentNonexistence_ResponseBody {
  constructor(params: Required<XRPPaymentNonexistence_ResponseBody>) {
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
export class XRPPaymentNonexistence_RequestBody {
  constructor(params: Required<XRPPaymentNonexistence_RequestBody>) {
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
  @Transform(transformHash32)
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
   * Whether to consider the firstMemoDataHash field in the search.
   */
  @IsBoolean()
  @ApiProperty({
    description: `Whether to consider the firstMemoDataHash field in the search.`,
    example: true,
  })
  checkFirstMemoData: boolean;

  /**
   * Hash of the MemoData field of the first Memo in the transaction.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `Hash of the MemoData field of the first Memo in the transaction.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  firstMemoDataHash: string;

  /**
   * Whether to consider the destinationTag field in the search.
   */
  @IsBoolean()
  @ApiProperty({
    description: `Whether to consider the destinationTag field in the search.`,
    example: true,
  })
  checkDestinationTag: boolean;

  /**
   * Destination tag of the transaction.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Destination tag of the transaction.`,
    example: '123',
  })
  destinationTag: string;

  /**
   * Address authorized to use the proof, where applicable.
   */
  @Validate(IsEVMAddress)
  @ApiProperty({
    description: `Address authorized to use the proof, where applicable.`,
    example: '0x5d4BEB38B6b71aaF6e30D0F9FeB6e21a7Ac40b3a',
  })
  proofOwner: string;
}
export class XRPPaymentNonexistence_Request {
  constructor(params: Required<XRPPaymentNonexistence_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x5852505061796d656e744e6f6e6578697374656e636500000000000000000000',
  })
  attestationType: string;

  /**
   * ID of the data source.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `ID of the data source.`,
    example:
      '0x444f474500000000000000000000000000000000000000000000000000000000',
  })
  sourceId: string;

  /**
   * Data defining the request. Type (struct) and interpretation is determined by the
   * `attestationType`.
   */
  @ValidateNested()
  @Type(() => XRPPaymentNonexistence_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: XRPPaymentNonexistence_RequestBody;
}
export class XRPPaymentNonexistence_Response {
  constructor(params: Required<XRPPaymentNonexistence_Response>) {
    Object.assign(this, params);
  }

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x5852505061796d656e744e6f6e6578697374656e636500000000000000000000',
  })
  attestationType: string;

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
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
  @Type(() => XRPPaymentNonexistence_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: XRPPaymentNonexistence_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the response
   * body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => XRPPaymentNonexistence_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: XRPPaymentNonexistence_ResponseBody;
}
export class XRPPaymentNonexistence_Proof {
  constructor(params: Required<XRPPaymentNonexistence_Proof>) {
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
  @Type(() => XRPPaymentNonexistence_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: XRPPaymentNonexistence_Response;
}
