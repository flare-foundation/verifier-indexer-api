import { prefix0x } from '@flarenetwork/mcc';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
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
export class AttestationResponseDTO_ConfirmedBlockHeightExists_Response {
  constructor(
    params: Required<AttestationResponseDTO_ConfirmedBlockHeightExists_Response>,
  ) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: ConfirmedBlockHeightExists_Response;
}

export class ConfirmedBlockHeightExists_ResponseBody {
  constructor(params: Required<ConfirmedBlockHeightExists_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * The timestamp of the block with `blockNumber`.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The timestamp of the block with 'blockNumber'.`,
    example: '123',
  })
  blockTimestamp: string;

  /**
   * The depth at which a block is considered confirmed depending on the chain. All attestation providers must agree on this number.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The depth at which a block is considered confirmed depending on the chain. All attestation providers must agree on this number.`,
    example: '123',
  })
  numberOfConfirmations: string;

  /**
   * The block number of the latest block that has a timestamp strictly smaller than `blockTimestamp` - `queryWindow`.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The block number of the latest block that has a timestamp strictly smaller than 'blockTimestamp' - 'queryWindow'.`,
    example: '123',
  })
  lowestQueryWindowBlockNumber: string;

  /**
   * The timestamp of the block at height `lowestQueryWindowBlockNumber`.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The timestamp of the block at height 'lowestQueryWindowBlockNumber'.`,
    example: '123',
  })
  lowestQueryWindowBlockTimestamp: string;
}

export class ConfirmedBlockHeightExists_RequestBody {
  constructor(params: Required<ConfirmedBlockHeightExists_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * The number of the block the request wants a confirmation of.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The number of the block the request wants a confirmation of.`,
    example: '123',
  })
  blockNumber: string;

  /**
   * The length of the period in which the block production rate is to be computed.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The length of the period in which the block production rate is to be computed.`,
    example: '123',
  })
  queryWindow: string;
}

export class ConfirmedBlockHeightExists_Request {
  constructor(params: Required<ConfirmedBlockHeightExists_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @Transform(({ value }) => prefix0x(value.toLowerCase()).toLowerCase())
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
  })
  attestationType: string;

  /**
   * ID of the data source.
   */
  @Validate(IsHash32)
  @Transform(({ value }) => prefix0x(value.toLowerCase()).toLowerCase())
  @ApiProperty({
    description: `ID of the data source.`,
    example:
      '0x444f474500000000000000000000000000000000000000000000000000000000',
  })
  sourceId: string;

  /**
   * Data defining the request. Type (struct) and interpretation is determined by the `attestationType`.
   */
  @ValidateNested()
  @Type(() => ConfirmedBlockHeightExists_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: ConfirmedBlockHeightExists_RequestBody;
}

export class ConfirmedBlockHeightExists_Response {
  constructor(params: Required<ConfirmedBlockHeightExists_Response>) {
    Object.assign(this, params);
  }

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @Transform(({ value }) => prefix0x(value.toLowerCase()).toLowerCase())
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x436f6e6669726d6564426c6f636b486569676874457869737473000000000000',
  })
  attestationType: string;

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @Transform(({ value }) => prefix0x(value.toLowerCase()).toLowerCase())
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
  @Type(() => ConfirmedBlockHeightExists_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: ConfirmedBlockHeightExists_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the response body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => ConfirmedBlockHeightExists_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: ConfirmedBlockHeightExists_ResponseBody;
}

export class ConfirmedBlockHeightExists_Proof {
  constructor(params: Required<ConfirmedBlockHeightExists_Proof>) {
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
  @Type(() => ConfirmedBlockHeightExists_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: ConfirmedBlockHeightExists_Response;
}
