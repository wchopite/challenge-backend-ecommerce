import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { appConfig, databaseConfig } from './shared/infrastructure/config/configuration.js';
import { validateEnv } from './shared/infrastructure/config/env.validation.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { StockModule } from './stock/stock.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
    CatalogModule,
    StockModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
