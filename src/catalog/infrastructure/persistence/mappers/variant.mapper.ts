import type { Variant } from '../../../domain/models/variant.js';
import type { VariantOrmEntity } from '../entities/variant.orm-entity.js';

export class VariantMapper {
  static toDomain(record: VariantOrmEntity): Variant {
    return {
      id: record.id,
      sku: record.sku,
      productId: record.productId,
      attributes: record.attributes,
    };
  }
}
