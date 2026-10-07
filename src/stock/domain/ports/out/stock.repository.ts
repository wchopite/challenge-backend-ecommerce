import type { StockMovement } from '../../models/stock-movement.js';

export const MovementStatus = {
  APPLIED: 'applied',
  INSUFFICIENT: 'insufficient',
} as const;

export type MovementStatus = (typeof MovementStatus)[keyof typeof MovementStatus];

export type RegisterMovementOutcome =
  | { readonly status: typeof MovementStatus.APPLIED; readonly available: number }
  | { readonly status: typeof MovementStatus.INSUFFICIENT; readonly available: number };

export const STOCK_REPOSITORY = Symbol('STOCK_REPOSITORY');

export interface StockRepository {
  register(movement: StockMovement): Promise<RegisterMovementOutcome>;
  getAvailable(variantId: string): Promise<number>;
}
