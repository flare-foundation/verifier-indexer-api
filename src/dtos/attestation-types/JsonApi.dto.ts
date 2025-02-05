import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Is0xHex, IsHash32, IsUnsignedIntLike } from '../dto-validators';
import { AttestationResponseStatus } from '../../verification/response-status';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_JsonApi_Response {
  constructor(params: Required<AttestationResponseDTO_JsonApi_Response>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: JsonApi_Response;
}

export class JsonApi_ResponseBody {
  constructor(params: Required<JsonApi_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * ABI encoded data
   */
  @Validate(Is0xHex)
  @ApiProperty({ description: `ABI encoded data`, example: '0x1234abcd' })
  abi_encoded_data: string;
}

export class JsonApi_RequestBody {
  constructor(params: Required<JsonApi_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * URL of the data source
   */
  @IsString()
  @ApiProperty({
    description: `URL of the data source`,
    example: 'https://flare-systems-explorer.flare.network/',
  })
  url: string;

  /**
   * jq filter to postprocess the data
   */
  @IsString()
  @ApiProperty({
    description: `jq filter to postprocess the data`,
    example: '.[] | select(.age > 25)',
  })
  postprocessJq: string;

  /**
   * ABI signature of the data
   */
  @IsString()
  @ApiProperty({
    description: `ABI signature of the data`,
    example: 'struct Person { string name; uint256 age; }',
  })
  abi_signature: string;
}

export class JsonApi_Request {
  constructor(params: Required<JsonApi_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x4a736f6e41706900000000000000000000000000000000000000000000000000',
  })
  attestationType: string;

  /**
   * ID of the data source.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the data source.`,
    example:
      '0x5745423200000000000000000000000000000000000000000000000000000000',
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
   * Data defining the request. Type (struct) and interpretation is determined
   */
  @ValidateNested()
  @Type(() => JsonApi_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined`,
  })
  requestBody: JsonApi_RequestBody;
}

export class JsonApi_Response {
  constructor(params: Required<JsonApi_Response>) {
    Object.assign(this, params);
  }

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x4a736f6e41706900000000000000000000000000000000000000000000000000',
  })
  attestationType: string;

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x5745423200000000000000000000000000000000000000000000000000000000',
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
  @Type(() => JsonApi_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: JsonApi_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction
   */
  @ValidateNested()
  @Type(() => JsonApi_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction`,
  })
  responseBody: JsonApi_ResponseBody;
}

export class JsonApi_Proof {
  constructor(params: Required<JsonApi_Proof>) {
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
  @Type(() => JsonApi_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: JsonApi_Response;
}
