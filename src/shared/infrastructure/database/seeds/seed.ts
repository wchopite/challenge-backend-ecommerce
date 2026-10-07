import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../../app.module.js';
import {
  REGISTER_STOCK_MOVEMENT,
  type RegisterStockMovement,
} from '../../../../stock/domain/ports/in/register-stock-movement.js';
import { SeedService } from './seed.service.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const registerMovement = app.get<RegisterStockMovement>(REGISTER_STOCK_MOVEMENT);

    await new SeedService(dataSource, registerMovement).run();

    console.log('Seed completed successfully');
  } finally {
    await app.close();
  }
}

void bootstrap();
