import { ApiProperty } from '@nestjs/swagger';
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
import { HTTP_METHOD } from '../../verification/web-2-json/utils';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_Web2Json_Response {
  constructor(params: Required<AttestationResponseDTO_Web2Json_Response>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: Web2Json_Response;
}

export class Web2Json_ResponseBody {
  constructor(params: Required<Web2Json_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * ABI encoded data
   */
  @Validate(Is0xHex)
  @ApiProperty({ description: `ABI encoded data`, example: '0x1234abcd' })
  abiEncodedData: string;
}

export class Web2Json_RequestBody {
  constructor(params: Required<Web2Json_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * URL of the data source
   */
  @IsString()
  @ApiProperty({
    description: `URL of the data source`,
    example: 'https://jsonplaceholder.typicode.com/todos',
  })
  url: string;

  /**
   * HTTP method to be used to fetch from URL source
   */
  @IsEnum(HTTP_METHOD)
  @ApiProperty({
    description: `HTTP method to be used to fetch from URL source`,
    example: 'GET',
    enum: HTTP_METHOD,
  })
  httpMethod: HTTP_METHOD;

  /**
   * Headers to be included to fetch from URL source
   */
  @IsString()
  @ApiProperty({
    description: `Headers to be included to fetch from URL source. Use '{}' if not headers are needed.`,
    example: '{"Content-Type":"application/json"}',
  })
  headers: string;

  /**
   * Query parameters to be included to fetch from URL source. Use '{}' if no query parameters are needed.
   */
  @IsString()
  @ApiProperty({
    description: `Query parameters to be included to fetch from URL source. Use '{}' if no query parameters are needed.`,
    example: '{"id": 1}',
  })
  queryParams: string;

  /**
   * Request body to be included to fetch from URL source. Use '{}' if no request body is required.
   */
  @IsString()
  @ApiProperty({
    description: `Request body to be included to fetch from URL source. Use '{}' if no request body is required.`,
    example: '{}',
  })
  body: string;

  /**
   * jq filter used to post-process the JSON response from the URL
   */
  @IsString()
  @ApiProperty({
    description: `jq filter used to post-process the JSON response from the URL`,
    example: '.[0]',
  })
  postProcessJq: string;

  /**
   * ABI signature of the data
   */
  @IsString()
  @ApiProperty({
    description: `ABI signature of the data`,
    example:
      '{"components": [{"internalType": "uint8","name": "userId","type": "uint8"},{"internalType": "uint8","name": "id","type": "uint8"},{"internalType": "string","name": "title","type": "string"},{"internalType": "bool","name": "completed","type": "bool"}],"name": "task","type": "tuple"}',
  })
  abiSignature: string;
}

export class Web2Json_Request {
  constructor(params: Required<Web2Json_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x576562324a736f6e000000000000000000000000000000000000000000000000',
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
  @Type(() => Web2Json_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined`,
  })
  requestBody: Web2Json_RequestBody;
}

export class Web2Json_Response {
  constructor(params: Required<Web2Json_Response>) {
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
  @Type(() => Web2Json_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: Web2Json_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction
   */
  @ValidateNested()
  @Type(() => Web2Json_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction`,
  })
  responseBody: Web2Json_ResponseBody;
}

export class Web2Json_Proof {
  constructor(params: Required<Web2Json_Proof>) {
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
  @Type(() => Web2Json_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: Web2Json_Response;
}
