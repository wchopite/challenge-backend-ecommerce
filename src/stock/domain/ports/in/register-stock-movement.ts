import type { Motive } from '../../motive/motive.js';

export interface RegisterStockMovementCommand {
  readonly sku: string;
  readonly quantity: number;
  readonly motive: Motive;
}

export interface StockMovementResult {
  readonly id: string;
  readonly sku: string;
  readonly variantId: string;
  readonly quantity: number;
  readonly motive: Motive;
  readonly available: number;
  readonly occurredAt: Date;
}

export const REGISTER_STOCK_MOVEMENT = Symbol('REGISTER_STOCK_MOVEMENT');

export interface RegisterStockMovement {
  execute(command: RegisterStockMovementCommand): Promise<StockMovementResult>;
}
