import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { appConfig, databaseConfig } from './shared/infrastructure/config/configuration.js';
import { validateEnv } from './shared/infrastructure/config/env.validation.js';
import { StockModule } from './stock/stock.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres' as const,
        host: config.get<string>('database.host', 'localhost'),
        port: config.get<number>('database.port', 5432),
        username: config.get<string>('database.username', 'postgres'),
        password: config.get<string>('database.password', 'postgres'),
        database: config.get<string>('database.database', 'ecommerce_challenge'),
        entities: [import.meta.dirname + '/**/*.orm-entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    CatalogModule,
    StockModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
