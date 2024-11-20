import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
export class AttestationResponseDTO_BalanceDecreasingTransaction_Response {
  constructor(
    params: Required<AttestationResponseDTO_BalanceDecreasingTransaction_Response>,
  ) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: BalanceDecreasingTransaction_Response;
}

export class BalanceDecreasingTransaction_ResponseBody {
  constructor(params: Required<BalanceDecreasingTransaction_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * The number of the block in which the transaction is included.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The number of the block in which the transaction is included.`,
    example: '123',
  })
  blockNumber: string;

  /**
   * The timestamp of the block in which the transaction is included.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The timestamp of the block in which the transaction is included.`,
    example: '123',
  })
  blockTimestamp: string;

  /**
   * Standard address hash of the address indicated by the `sourceAddressIndicator`.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Standard address hash of the address indicated by the 'sourceAddressIndicator'.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  sourceAddressHash: string;

  /**
   * Amount spent by the source address in minimal units.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Amount spent by the source address in minimal units.`,
    example: '123',
  })
  spentAmount: string;

  /**
   * Standard payment reference of the transaction.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Standard payment reference of the transaction.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  standardPaymentReference: string;
}

export class BalanceDecreasingTransaction_RequestBody {
  constructor(params: Required<BalanceDecreasingTransaction_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * ID of the payment transaction.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the payment transaction.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  transactionId: string;

  /**
   * The indicator of the address whose balance has been decreased.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `The indicator of the address whose balance has been decreased.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  sourceAddressIndicator: string;
}

export class BalanceDecreasingTransaction_Request {
  constructor(params: Required<BalanceDecreasingTransaction_Request>) {
    Object.assign(this, params);
  }

  /**
   * ID of the attestation type.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `ID of the attestation type.`,
    example:
      '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
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
  @Type(() => BalanceDecreasingTransaction_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: BalanceDecreasingTransaction_RequestBody;
}

export class BalanceDecreasingTransaction_Response {
  constructor(params: Required<BalanceDecreasingTransaction_Response>) {
    Object.assign(this, params);
  }

  /**
   * Extracted from the request.
   */
  @Validate(IsHash32)
  @ApiProperty({
    description: `Extracted from the request.`,
    example:
      '0x42616c616e636544656372656173696e675472616e73616374696f6e00000000',
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
   * The ID of the State Connector round in which the request was considered. This is a security measure to prevent a collision of attestation hashes.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `The ID of the State Connector round in which the request was considered. This is a security measure to prevent a collision of attestation hashes.`,
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
  @Type(() => BalanceDecreasingTransaction_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: BalanceDecreasingTransaction_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the response body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => BalanceDecreasingTransaction_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: BalanceDecreasingTransaction_ResponseBody;
}

export class BalanceDecreasingTransaction_Proof {
  constructor(params: Required<BalanceDecreasingTransaction_Proof>) {
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
  @Type(() => BalanceDecreasingTransaction_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: BalanceDecreasingTransaction_Response;
}

export class BalanceDecreasingTransaction_RequestNoMic extends OmitType<
  BalanceDecreasingTransaction_Request,
  'messageIntegrityCode'
>(BalanceDecreasingTransaction_Request, ['messageIntegrityCode'] as const) {}
