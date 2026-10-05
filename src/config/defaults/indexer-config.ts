import { getPositiveIntEnv } from '../env';
import { DatabaseConfig } from '../interfaces/chain-indexer';

export function getDatabaseConfig(): DatabaseConfig {
  return {
    database: process.env.DB_DATABASE || 'database',
    host: process.env.DB_HOST || '127.0.0.1',
    port: getPositiveIntEnv('DB_PORT', 8080),
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
  };
}
