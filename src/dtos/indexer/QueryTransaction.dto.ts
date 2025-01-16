import { unPrefix0x } from '@flarenetwork/mcc';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Validate } from 'class-validator';
import { IsHash32 } from '../dto-validators';
import { transformUnprefix0x } from '../dto-transform-utils';

/**
 * Query parameters for listing transactions from indexer database.
 */
export class QueryTransaction {
  /**
   * Minimal block number of query range
   */
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  from?: number;
  /**
   * Maximal block number of the query range
   */
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  to?: number;
  /**
   * 0x-prefixed lowercase hex string representing 32-bytes
   */
  @IsOptional()
  paymentReference?: string;
  /**
   * Query limit. Capped by server config settings
   */
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
  /**
   * Query offset
   */
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  offset?: number;
  /**
   * Whether response from node stored in the indexer database should be returned
   */
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  returnResponse?: boolean;
}

/**
 * Query parameters for detail transactions from indexer database.
 */
export class QueryTransactionDetail {
  /**
   * Transaction id (hash)
   */

  @Validate(IsHash32)
  @Transform(transformUnprefix0x)
  txHash: string;
}
