import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface DatabaseConfig {
  /**
   * Database server address (host)
   */
  host: string; // "localhost";

  /**
   * Database name.
   */
  database: string; // "database";

  /**
   * Database server port number.
   */
  port: number; // 3306

  /**
   * Database user name.
   */
  username: string; //"username";

  /**
   * Database user password.
   */
  password: string; //"password";
}

export interface IndexerConfig {
  db: DatabaseConfig;
  typeOrmModuleOptions: TypeOrmModuleOptions;

  /**
   * The page size for indexer API queries when listing outputs
   */
  indexerServerPageLimit: number;

  /**
   * The number of confirmations required for a transaction to be considered confirmed
   */
  numberOfConfirmations: number;
}
