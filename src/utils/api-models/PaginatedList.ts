import { ApiProperty } from "@nestjs/swagger";

export class PaginatedList<T> {
  // /**
  //  * Count of all items satisfying 'paginatable' request.
  //  */
  // @ApiProperty()
  // count: number;
  /**
   * Response items.
   */
  items: T[];
  /**
   * Limit got from request
   */
  @ApiProperty()
  limit: number;
  /**
   * Offset got from request
   */
  @ApiProperty()
  offset: number;

  constructor(items: T[], limit: number, offset: number) {
    this.items = items;
    this.limit = limit;
    this.offset = offset;
  }
}
