import { join } from 'node:path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const baseDir = import.meta.dirname;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'ecommerce_challenge',
  entities: [join(baseDir, '../../../**/*.orm-entity.{ts,js}')],
  migrations: [join(baseDir, 'migrations/*.{ts,js}')],
  synchronize: false,
});
