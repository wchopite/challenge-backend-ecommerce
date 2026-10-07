import type { Motive } from '../../../domain/motive/motive.js';

export class StockMovementResponseDto {
  id: string;
  sku: string;
  variantId: string;
  quantity: number;
  motive: Motive;
  available: number;
  occurredAt: Date;
}
