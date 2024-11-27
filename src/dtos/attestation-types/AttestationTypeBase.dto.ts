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
export class AttestationResponseDTO_AttestationTypeBase_Response {
  constructor(
    params: Required<AttestationResponseDTO_AttestationTypeBase_Response>,
  ) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: AttestationTypeBase_Response;
}

export class AttestationTypeBase_ResponseBody {
  constructor(params: Required<AttestationTypeBase_ResponseBody>) {
    Object.assign(this, params);
  }
}

export class AttestationTypeBase_RequestBody {
  constructor(params: Required<AttestationTypeBase_RequestBody>) {
    Object.assign(this, params);
  }
}

export class AttestationTypeBase_Request {
  constructor(params: Required<AttestationTypeBase_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @Transform(({ value }) => prefix0x(value).toLowerCase())
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
  @Transform(({ value }) => prefix0x(value).toLowerCase())
  @ApiProperty({
    description: `Id of the data source.`,
    example:
      '0x444f474500000000000000000000000000000000000000000000000000000000',
  })
  sourceId: string;

  /**
   * Data defining the request. Type (struct) and interpretation is determined by the `attestationType`.
   */
  @ValidateNested()
  @Type(() => AttestationTypeBase_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: AttestationTypeBase_RequestBody;
}

export class AttestationTypeBase_Response {
  constructor(params: Required<AttestationTypeBase_Response>) {
    Object.assign(this, params);
  }

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @Transform(({ value }) => prefix0x(value).toLowerCase())
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
  @Transform(({ value }) => prefix0x(value).toLowerCase())
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
  @Type(() => AttestationTypeBase_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: AttestationTypeBase_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the response body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => AttestationTypeBase_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: AttestationTypeBase_ResponseBody;
}

export class AttestationTypeBase_Proof {
  constructor(params: Required<AttestationTypeBase_Proof>) {
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
  @Type(() => AttestationTypeBase_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: AttestationTypeBase_Response;
}
