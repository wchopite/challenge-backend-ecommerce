import { InvalidQuantityError } from '../errors/invalid-quantity.error.js';
import type { Motive } from '../motive/motive.js';

export interface StockMovement {
  readonly id: string;
  readonly variantId: string;
  readonly sku: string;
  readonly quantity: number;
  readonly motive: Motive;
  readonly occurredAt: Date;
}

export function assertPositiveQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
}
