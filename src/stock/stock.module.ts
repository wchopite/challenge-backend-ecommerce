import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from '../catalog/catalog.module.js';
import { GetVariantAvailabilityUseCase } from './application/use-cases/get-variant-availability.use-case.js';
import { RegisterStockMovementUseCase } from './application/use-cases/register-stock-movement.use-case.js';
import { GET_VARIANT_AVAILABILITY } from './domain/ports/in/get-variant-availability.js';
import { REGISTER_STOCK_MOVEMENT } from './domain/ports/in/register-stock-movement.js';
import { STOCK_REPOSITORY } from './domain/ports/out/stock.repository.js';
import { VARIANT_CATALOG } from './domain/ports/out/variant-catalog.js';
import { CatalogVariantAdapter } from './infrastructure/catalog/catalog-variant.adapter.js';
import { StockController } from './infrastructure/http/stock.controller.js';
import { StockItemOrmEntity } from './infrastructure/persistence/entities/stock-item.orm-entity.js';
import { StockMovementOrmEntity } from './infrastructure/persistence/entities/stock-movement.orm-entity.js';
import { TypeOrmStockRepository } from './infrastructure/persistence/repositories/typeorm-stock.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([StockItemOrmEntity, StockMovementOrmEntity]), CatalogModule],
  controllers: [StockController],
  providers: [
    { provide: REGISTER_STOCK_MOVEMENT, useClass: RegisterStockMovementUseCase },
    { provide: GET_VARIANT_AVAILABILITY, useClass: GetVariantAvailabilityUseCase },
    { provide: STOCK_REPOSITORY, useClass: TypeOrmStockRepository },
    { provide: VARIANT_CATALOG, useClass: CatalogVariantAdapter },
  ],
})
export class StockModule {}
