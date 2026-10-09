import { InsufficientStockError } from './insufficient-stock.error.js';
import { InvalidQuantityError } from './invalid-quantity.error.js';
import { MovementAlreadyProcessedError } from './movement-already-processed.error.js';
import { VariantNotFoundError } from './variant-not-found.error.js';

describe('domain error details', () => {
  it('InsufficientStockError exposes available, requested and extra context', () => {
    const error = new InsufficientStockError(2, 5, { sku: 'SKU-1', motive: 'SALE' });

    expect(error.details).toEqual({ available: 2, requested: 5, sku: 'SKU-1', motive: 'SALE' });
  });

  it('MovementAlreadyProcessedError exposes the idempotency key and context', () => {
    const error = new MovementAlreadyProcessedError('key-1', { sku: 'SKU-1' });

    expect(error.details).toEqual({ idempotencyKey: 'key-1', sku: 'SKU-1' });
  });

  it('VariantNotFoundError exposes the sku', () => {
    expect(new VariantNotFoundError('SKU-9').details).toEqual({ sku: 'SKU-9' });
  });

  it('InvalidQuantityError exposes the quantity', () => {
    expect(new InvalidQuantityError(0).details).toEqual({ quantity: 0 });
  });
});
