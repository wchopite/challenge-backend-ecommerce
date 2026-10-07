import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetVariantUseCase } from './application/use-cases/get-variant.use-case.js';
import { CATALOG_READER } from './domain/ports/in/catalog-reader.js';
import { VARIANT_REPOSITORY } from './domain/ports/out/variant.repository.js';
import { CategoryOrmEntity } from './infrastructure/persistence/entities/category.orm-entity.js';
import { ProductOrmEntity } from './infrastructure/persistence/entities/product.orm-entity.js';
import { VariantOrmEntity } from './infrastructure/persistence/entities/variant.orm-entity.js';
import { TypeOrmVariantRepository } from './infrastructure/persistence/repositories/typeorm-variant.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity, ProductOrmEntity, VariantOrmEntity])],
  providers: [
    GetVariantUseCase,
    { provide: VARIANT_REPOSITORY, useClass: TypeOrmVariantRepository },
    { provide: CATALOG_READER, useExisting: GetVariantUseCase },
  ],
  exports: [CATALOG_READER],
})
export class CatalogModule {}
