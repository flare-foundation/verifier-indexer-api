import { BdStateUnit } from '../indexer/ApiDbState.dto';

/**
 * State of the EVM node backing the verifier
 */
export class ApiEvmState {
  /**
   * Last observed block (on the chain)
   */
  chain_tip_block: BdStateUnit;
}
