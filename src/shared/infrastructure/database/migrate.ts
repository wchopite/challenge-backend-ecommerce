import 'reflect-metadata';
import { AppDataSource } from './data-source.js';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const migrations = await AppDataSource.runMigrations();
    console.log(`Migrations executed: ${migrations.length}`);
  } finally {
    await AppDataSource.destroy();
  }
}

void bootstrap();
