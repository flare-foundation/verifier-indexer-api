import { prefix0x } from '@flarenetwork/mcc';
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
import { IsHash32, IsUnsignedIntLike } from '../dto-validators';
import { AttestationResponseStatus } from '../generic/generic.dto';
import { transformHash32 } from '../dto-transform-utils';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_Payment_Response {
  constructor(params: Required<AttestationResponseDTO_Payment_Response>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: Payment_Response;
}

export class Payment_ResponseBody {
  constructor(params: Required<Payment_ResponseBody>) {
    Object.assign(this, params);
  }

  /**
   * Number of the block in which the transaction is included.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Number of the block in which the transaction is included.`,
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
   * Standard address hash of the source address.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `Standard address hash of the source address.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  sourceAddressHash: string;

  /**
   * The root of the Merkle tree of the source addresses.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `The root of the Merkle tree of the source addresses.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  sourceAddressesRoot: string;

  /**
   * Standard address hash of the receiving address. The zero 32-byte string if there is no receivingAddress (if `status` is not success).
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `Standard address hash of the receiving address. The zero 32-byte string if there is no receivingAddress (if 'status' is not success).`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  receivingAddressHash: string;

  /**
   * Standard address hash of the intended receiving address. Relevant if the transaction is unsuccessful.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `Standard address hash of the intended receiving address. Relevant if the transaction is unsuccessful.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  intendedReceivingAddressHash: string;

  /**
   * Amount in minimal units spent by the source address.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Amount in minimal units spent by the source address.`,
    example: '123',
  })
  spentAmount: string;

  /**
   * Amount in minimal units to be spent by the source address. Relevant if the transaction status is unsuccessful.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Amount in minimal units to be spent by the source address. Relevant if the transaction status is unsuccessful.`,
    example: '123',
  })
  intendedSpentAmount: string;

  /**
   * Amount in minimal units received by the receiving address.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Amount in minimal units received by the receiving address.`,
    example: '123',
  })
  receivedAmount: string;

  /**
   * Amount in minimal units intended to be received by the receiving address. Relevant if the transaction is unsuccessful.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Amount in minimal units intended to be received by the receiving address. Relevant if the transaction is unsuccessful.`,
    example: '123',
  })
  intendedReceivedAmount: string;

  /**
   * [Standard payment reference](/specs/attestations/external-chains/standardPaymentReference.md) of the transaction.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `[Standard payment reference](/specs/attestations/external-chains/standardPaymentReference.md) of the transaction.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  standardPaymentReference: string;

  /**
   * Indicator whether only one source and one receiver are involved in the transaction.
   */
  @IsBoolean()
  @ApiProperty({
    description: `Indicator whether only one source and one receiver are involved in the transaction.`,
    example: true,
  })
  oneToOne: boolean;

  /**
   * [Succes status](/specs/attestations/external-chains/transactions.md#transaction-success-status) of the transaction: 0 - success, 1 - failed by sender's fault,x  2 - failed by receiver's fault.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `[Succes status](/specs/attestations/external-chains/transactions.md#transaction-success-status) of the transaction: 0 - success, 1 - failed by sender's fault,x  2 - failed by receiver's fault.`,
    example: '123',
  })
  status: string;
}

export class Payment_RequestBody {
  constructor(params: Required<Payment_RequestBody>) {
    Object.assign(this, params);
  }

  /**
   * ID of the payment transaction.
   */
  @Validate(IsHash32)
  @Transform(transformHash32)
  @ApiProperty({
    description: `ID of the payment transaction.`,
    example:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  })
  transactionId: string;

  /**
   * For UTXO chains, this is the index of the transaction input with source address. Always 0 for the non-utxo chains.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `For UTXO chains, this is the index of the transaction input with source address. Always 0 for the non-utxo chains.`,
    example: '123',
  })
  inUtxo: string;

  /**
   * For UTXO chains, this is the index of the transaction output with receiving address. Always 0 for the non-utxo chains.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `For UTXO chains, this is the index of the transaction output with receiving address. Always 0 for the non-utxo chains.`,
    example: '123',
  })
  utxo: string;
}

export class Payment_Request {
  constructor(params: Required<Payment_Request>) {
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
      '0x5061796d656e7400000000000000000000000000000000000000000000000000',
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
   * Data defining the request. Type (struct) and interpretation is determined by the `attestationType`.
   */
  @ValidateNested()
  @Type(() => Payment_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: Payment_RequestBody;
}

export class Payment_Response {
  constructor(params: Required<Payment_Response>) {
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
      '0x5061796d656e7400000000000000000000000000000000000000000000000000',
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
  @Type(() => Payment_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: Payment_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the response body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => Payment_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: Payment_ResponseBody;
}

export class Payment_Proof {
  constructor(params: Required<Payment_Proof>) {
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
  @Type(() => Payment_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: Payment_Response;
}
