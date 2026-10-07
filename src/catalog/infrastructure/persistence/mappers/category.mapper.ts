import type { Category } from '../../../domain/models/category.js';
import type { CategoryOrmEntity } from '../entities/category.orm-entity.js';

export class CategoryMapper {
  static toDomain(record: CategoryOrmEntity): Category {
    return {
      id: record.id,
      name: record.name,
    };
  }
}
