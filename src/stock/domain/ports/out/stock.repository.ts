import type { StockMovement } from '../../models/stock-movement.js';

export type RegisterMovementOutcome =
  | { readonly status: 'applied'; readonly available: number }
  | { readonly status: 'insufficient'; readonly available: number };

export const STOCK_REPOSITORY = Symbol('STOCK_REPOSITORY');

export interface StockRepository {
  register(movement: StockMovement): Promise<RegisterMovementOutcome>;
  getAvailable(variantId: string): Promise<number>;
}
