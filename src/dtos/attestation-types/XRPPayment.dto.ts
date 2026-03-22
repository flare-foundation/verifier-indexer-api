import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { AttestationResponseStatus } from '../../verification/response-status';
import { transformHash32 } from '../dto-transform-utils';
import {
  Is0xHex,
  IsEVMAddress,
  IsHash32,
  IsUnsignedIntLike,
} from '../dto-validators';

///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// DTOs /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Attestation response for specific attestation type (flattened)
 */
export class AttestationResponseDTO_XRPPayment_Response {
  constructor(params: Required<AttestationResponseDTO_XRPPayment_Response>) {
    Object.assign(this, params);
  }

  status: AttestationResponseStatus;

  response?: XRPPayment_Response;
}

export class XRPPayment_ResponseBody {
  constructor(params: Required<XRPPayment_ResponseBody>) {
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
   * Address string of the source address (r address).
   */
  @IsString()
  @ApiProperty({
    description: `Address string of the source address (r address).`,
    example: 'Example string',
  })
  sourceAddress: string;

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
   * Standard address hash of the receiving address.
   * The zero 32-byte string if there is no receivingAddress (if `status` is not success).
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
   * Standard address hash of the intended receiving address.
   * Relevant if the transaction is unsuccessful.
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
   * Amount in minimal units to be spent by the source address.
   * Relevant if the transaction status is unsuccessful.
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
   * Amount in minimal units intended to be received by the receiving address.
   * Relevant if the transaction is unsuccessful.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Amount in minimal units intended to be received by the receiving address. Relevant if the transaction is unsuccessful.`,
    example: '123',
  })
  intendedReceivedAmount: string;

  /**
   * True if the transaction has a MemoData field, false otherwise.
   */
  @IsBoolean()
  @ApiProperty({
    description: `True if the transaction has a MemoData field, false otherwise.`,
    example: true,
  })
  hasMemoData: boolean;

  /**
   * Raw bytes of MemoData filed of first Memo in the transaction, empty if no Memo is present.
   */
  @Validate(Is0xHex)
  @ApiProperty({
    description: `Raw bytes of MemoData filed of first Memo in the transaction, empty if no Memo is present.`,
    example: '0x1234abcd',
  })
  firstMemoData: string;

  /**
   * True if the transaction has a destination tag, false otherwise.
   */
  @IsBoolean()
  @ApiProperty({
    description: `True if the transaction has a destination tag, false otherwise.`,
    example: true,
  })
  hasDestinationTag: boolean;

  /**
   * Destination tag of the transaction, 0 if no destination tag is present,
   * see hasDestinationTag for indication if transaction has destination tag.
   * Currently XRPL only supports destination tags that are uint32 values.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Destination tag of the transaction, 0 if no destination tag is present, see hasDestinationTag for indication if transaction has destination tag. Currently XRPL only supports destination tags that are uint32 values.`,
    example: '123',
  })
  destinationTag: string;

  /**
   * Success status of the transaction: 0 - success, 1 - failed by sender's fault,
   * 2 - failed by receiver's fault.
   */
  @Validate(IsUnsignedIntLike)
  @ApiProperty({
    description: `Success status of the transaction: 0 - success, 1 - failed by sender's fault, 2 - failed by receiver's fault.`,
    example: '123',
  })
  status: string;
}
export class XRPPayment_RequestBody {
  constructor(params: Required<XRPPayment_RequestBody>) {
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
   * Address authorized to use the proof, where applicable.
   */
  @Validate(IsEVMAddress)
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @ApiProperty({
    description: `Address authorized to use the proof, where applicable.`,
    example: '0x5d4beb38b6b71aaf6e30d0f9feb6e21a7ac40b3a',
  })
  proofOwner: string;
}
export class XRPPayment_Request {
  constructor(params: Required<XRPPayment_Request>) {
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
      '0x5852505061796d656e7400000000000000000000000000000000000000000000',
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
   * Data defining the request. Type (struct) and interpretation is determined by
   * the `attestationType`.
   */
  @ValidateNested()
  @Type(() => XRPPayment_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the request. Type (struct) and interpretation is determined by the 'attestationType'.`,
  })
  requestBody: XRPPayment_RequestBody;
}
export class XRPPayment_Response {
  constructor(params: Required<XRPPayment_Response>) {
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
      '0x5852505061796d656e7400000000000000000000000000000000000000000000',
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
  @Type(() => XRPPayment_RequestBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Extracted from the request.` })
  requestBody: XRPPayment_RequestBody;

  /**
   * Data defining the response. The verification rules for the construction of the
   * response body and the type are defined per specific `attestationType`.
   */
  @ValidateNested()
  @Type(() => XRPPayment_ResponseBody)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({
    description: `Data defining the response. The verification rules for the construction of the response body and the type are defined per specific 'attestationType'.`,
  })
  responseBody: XRPPayment_ResponseBody;
}
export class XRPPayment_Proof {
  constructor(params: Required<XRPPayment_Proof>) {
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
  @Type(() => XRPPayment_Response)
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ApiProperty({ description: `Attestation response.` })
  data: XRPPayment_Response;
}
