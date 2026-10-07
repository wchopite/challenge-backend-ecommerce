import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CatalogModule } from './catalog/catalog.module.js';
import { appConfig, databaseConfig } from './shared/infrastructure/config/configuration.js';
import { validateEnv } from './shared/infrastructure/config/env.validation.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { HealthModule } from './shared/infrastructure/health/health.module.js';
import { AllExceptionsFilter } from './shared/infrastructure/http/filters/all-exceptions.filter.js';
import { DomainExceptionFilter } from './shared/infrastructure/http/filters/domain-exception.filter.js';
import { ObservabilityModule } from './shared/infrastructure/observability/observability.module.js';
import { StockModule } from './stock/stock.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [appConfig, databaseConfig],
    }),
    ObservabilityModule,
    DatabaseModule,
    HealthModule,
    CatalogModule,
    StockModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
