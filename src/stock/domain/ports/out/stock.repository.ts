import type { RegisterMovementOutcome } from '../../models/register-movement-outcome.js';
import type { StockMovement } from '../../models/stock-movement.js';

export const STOCK_REPOSITORY = Symbol('STOCK_REPOSITORY');

export interface StockRepository {
  register(movement: StockMovement, idempotencyKey: string): Promise<RegisterMovementOutcome>;
  getAvailable(variantId: string): Promise<number>;
}
