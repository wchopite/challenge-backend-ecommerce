import type { StockMovement } from '../../../domain/models/stock-movement.js';
import { StockMovementOrmEntity } from '../entities/stock-movement.orm-entity.js';

export class StockMovementMapper {
  static toOrm(movement: StockMovement, idempotencyKey: string): StockMovementOrmEntity {
    const record = new StockMovementOrmEntity();
    record.id = movement.id;
    record.variantId = movement.variantId;
    record.sku = movement.sku;
    record.quantity = movement.quantity;
    record.motive = movement.motive;
    record.idempotencyKey = idempotencyKey;
    record.occurredAt = movement.occurredAt;
    return record;
  }
}
