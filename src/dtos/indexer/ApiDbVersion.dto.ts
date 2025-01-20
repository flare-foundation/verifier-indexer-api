/**
 * Project version entry in the database
 */
export class Version {
  /**
   * Git tag of the project
   */
  gitTag: string;

  /**
   * Git hash of the project
   */
  gitHash: string;

  /**
   * Build date of the project
   */
  buildDate: number;
}

/**
 * Indexer version entry in the database
 */
export class IndexerVersion extends Version {
  /**
   * Number of confirmations setting for indexer client
   */
  numConfirmations: number;

  /**
   * History drop setting for indexer client
   */
  historySeconds: number;
}

/**
 * All version entries in the database
 */
export class ApiDBVersion {
  /**
   * Version of connected indexer
   */
  indexer: IndexerVersion;

  /**
   * Version of api server
   */
  apiServer: Version;

  /**
   * Version of connected underlying node
   */
  nodeVersion: string;
}
