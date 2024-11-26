import { unPrefix0x } from "@flarenetwork/mcc";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Validate } from "class-validator";
import { IsHash32 } from "../dto-validators";

/**
 * Query parameters for listing blocks from indexer database.
 */
export class QueryBlock {
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
  }

  /**
 * Query parameters for detail block from indexer database.
 */
export class QueryBlockDetail {
  /**
   * Block hash
   */

  @Validate(IsHash32)
  @Transform(({ value }) => unPrefix0x(value))
  blockHash: string;
}
