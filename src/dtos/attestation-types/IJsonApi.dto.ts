import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Is0xHex, IsHash32, IsUnsignedIntLike } from '../dto-validators';
import { AttestationResponseStatus } from '../../verification/response-status';
import { HTTP_METHOD } from '../../verification/json-api/utils';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_IJsonApi_Response {
  constructor(params: Required<AttestationResponseDTO_IJsonApi_Response>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: IJsonApi_Response;
}

export class IJsonApi_ResponseBody {
  constructor(params: Required<IJsonApi_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * ABI encoded data
   */
  @Validate(Is0xHex)
  @ApiProperty({ description: `ABI encoded data`, example: '0x1234abcd' })
  abi_encoded_data: string;
}

export class IJsonApi_RequestBody {
  constructor(params: Required<IJsonApi_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * URL of the data source
   */
  @IsString()
  @ApiProperty({
    description: `URL of the data source`,
    example: 'https://jsonplaceholder.typicode.com/todos/1',
  })
  url: string;

  /**
   * HTTP method to be used to fetch from URL source
   */
  @IsEnum(HTTP_METHOD)
  @ApiProperty({
    description: `HTTP method to be used to fetch from URL source`,
    example: 'GET',
    enum: HTTP_METHOD
  })
  http_method: HTTP_METHOD;

  /**
   * Headers to be included to fetch from URL source
   */
  @IsString()
  @ApiProperty({
    description: `Headers to be included to fetch from URL source. Use '{}' if not headers are needed.`,
    example: '{"Content-Type":"application/json"}'
  })
  headers: string;

  /**
   * Query parameters to be included to fetch from URL source. Use '{}' if no query parameters are needed.
   */
  @IsString()
  @ApiProperty({
    description: `Query parameters to be included to fetch from URL source. Use '{}' if no query parameters are needed.`,
    example: '{"userId":1}'
  })
  query_params: string

  /**
   * Request body to be included to fetch from URL source. Use '{}' if no request body is required.
   */
  @IsString()
  @ApiProperty({
    description: `Request body to be included to fetch from URL source. Use '{}' if no request body is required.`,
    example: '{"userId":1,"completed":false}'
  })
  body: string

  /**
   * jq filter to postprocess the data
   */
  @IsString()
  @ApiProperty({
    description: `jq filter to postprocess the data`,
    example: '.',
  })
  postprocess_jq: string;

  /**
   * ABI signature of the data
   */
  @IsString()
  @ApiProperty({
    description: `ABI signature of the data`,
    example:
      '{"components": [{"internalType": "uint8","name": "userId","type": "uint8"},{"internalType": "uint8","name": "id","type": "uint8"},{"internalType": "string","name": "title","type": "string"},{"internalType": "bool","name": "completed","type": "bool"}],"name": "task","type": "tuple"}',
  })
  abi_signature: string;
}

export class IJsonApi_Request {
  constructor(params: Required<IJsonApi_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x494a736f6e417069000000000000000000000000000000000000000000000000',
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
   * Data defining the request. Type (struct) and interpretation is determined
   */
  @ValidateNested()
  @Type(() => IJsonApi_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined`,
  })
  requestBody: IJsonApi_RequestBody;
}

export class IJsonApi_Response {
  constructor(params: Required<IJsonApi_Response>) {
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
  @Type(() => IJsonApi_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: IJsonApi_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction
   */
  @ValidateNested()
  @Type(() => IJsonApi_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction`,
  })
  responseBody: IJsonApi_ResponseBody;
}

export class IJsonApi_Proof {
  constructor(params: Required<IJsonApi_Proof>) {
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
  @Type(() => IJsonApi_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: IJsonApi_Response;
}
