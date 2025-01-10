/**
 * State table entry of the indexer database
 */
export class ApiDBVersion {
  /**
   * Version of connected underlying node
   */
  nodeVersion: string;

  /**
   * Git tag of the indexer client
   */
  gitTag: string;

  /**
   * Git hash of the indexer client
   */
  gitHash: string;

  /**
   * Build date of the indexer client
   */
  buildDate: number;

  /**
   * Number of confirmations setting for indexer client
   */
  numConfirmations: number;

  /**
   * History drop setting for indexer client
   */
  historySeconds;
}
