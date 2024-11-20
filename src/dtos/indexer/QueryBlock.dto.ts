import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

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
  }