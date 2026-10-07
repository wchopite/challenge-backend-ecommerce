import type { Product } from '../../../domain/models/product.js';
import type { ProductOrmEntity } from '../entities/product.orm-entity.js';

export class ProductMapper {
  static toDomain(record: ProductOrmEntity): Product {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      priceCents: record.priceCents,
      categoryId: record.categoryId,
    };
  }
}
