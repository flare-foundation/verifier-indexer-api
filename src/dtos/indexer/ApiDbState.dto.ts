/**
 * State entry of the indexer database for a unit
 */
export class BdStateUnit {
  /**
   * block height
   */
  height: number;
  /**
   * block timestamp
   */
  timestamp: number;
  /**
   * Last updated timestamp
   */
  last_updated: number;
}

/**
 * State table entry of the indexer database
 */
export class ApiDBState {
  /**
   * First indexed block (in the database)
   */
  bottom_indexed_block: BdStateUnit;
  /**
   * Last indexed block (in the database)
   */
  top_indexed_block: BdStateUnit;
  /**
   * Last observed block (on the chain)
   */
  chain_tip_block: BdStateUnit;
}
