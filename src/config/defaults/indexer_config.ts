import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const database = {
  database: process.env.DB_DATABASE || 'database',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 8080,
  username: process.env.DB_USERNAME || 'username',
  password: process.env.DB_PASSWORD || 'password',
};
export const typeOrmModulePartialOptions: TypeOrmModuleOptions = {
  ... database,
  type: 'postgres',
  synchronize: false,
  migrationsRun: false,
  logging: false,
};
