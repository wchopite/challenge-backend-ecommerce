import { RegisterStockMovementUseCase } from './register-stock-movement.use-case.js';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error.js';
import { InvalidQuantityError } from '../../domain/errors/invalid-quantity.error.js';
import { MovementAlreadyProcessedError } from '../../domain/errors/movement-already-processed.error.js';
import { VariantNotFoundError } from '../../domain/errors/variant-not-found.error.js';
import { deltaOf, Motive } from '../../domain/motive/motive.js';
import type { StockMovement } from '../../domain/models/stock-movement.js';
import {
  MovementStatus,
  type RegisterMovementOutcome,
} from '../../domain/models/register-movement-outcome.js';
import type { StockRepository } from '../../domain/ports/out/stock.repository.js';
import type { VariantCatalog, VariantRef } from '../../domain/ports/out/variant-catalog.js';

class InMemoryVariantCatalog implements VariantCatalog {
  constructor(private readonly variants: readonly VariantRef[] = []) {}

  findBySku(sku: string): Promise<VariantRef | null> {
    return Promise.resolve(this.variants.find((variant) => variant.sku === sku) ?? null);
  }
}

class InMemoryStockRepository implements StockRepository {
  private readonly balances = new Map<string, number>();
  private readonly keys = new Set<string>();
  readonly movements: StockMovement[] = [];

  seed(variantId: string, available: number): void {
    this.balances.set(variantId, available);
  }

  register(movement: StockMovement, idempotencyKey: string): Promise<RegisterMovementOutcome> {
    if (this.keys.has(idempotencyKey)) {
      return Promise.resolve({ status: MovementStatus.DUPLICATE });
    }

    const current = this.balances.get(movement.variantId) ?? 0;
    const next = current + deltaOf(movement.motive, movement.quantity);

    if (next < 0) {
      return Promise.resolve({ status: MovementStatus.INSUFFICIENT, available: current });
    }

    this.keys.add(idempotencyKey);
    this.balances.set(movement.variantId, next);
    this.movements.push(movement);

    return Promise.resolve({ status: MovementStatus.APPLIED, available: next });
  }

  getAvailable(variantId: string): Promise<number> {
    return Promise.resolve(this.balances.get(variantId) ?? 0);
  }
}

describe('RegisterStockMovementUseCase', () => {
  const variant: VariantRef = { id: 'variant-1', sku: 'SKU-1' };

  const build = (stock: InMemoryStockRepository): RegisterStockMovementUseCase =>
    new RegisterStockMovementUseCase(new InMemoryVariantCatalog([variant]), stock);

  it('applies an inbound movement and returns the resulting availability', async () => {
    const stock = new InMemoryStockRepository();
    stock.seed(variant.id, 2);

    const result = await build(stock).execute({
      sku: 'SKU-1',
      quantity: 5,
      motive: Motive.PURCHASE,
      idempotencyKey: 'key-1',
    });

    expect(result.available).toBe(7);
    expect(result.variantId).toBe('variant-1');
    expect(stock.movements).toHaveLength(1);
  });

  it('applies an outbound movement and returns the resulting availability', async () => {
    const stock = new InMemoryStockRepository();
    stock.seed(variant.id, 10);

    const result = await build(stock).execute({
      sku: 'SKU-1',
      quantity: 3,
      motive: Motive.SALE,
      idempotencyKey: 'key-2',
    });

    expect(result.available).toBe(7);
  });

  it('throws InsufficientStockError when an outbound movement exceeds availability', async () => {
    const stock = new InMemoryStockRepository();
    stock.seed(variant.id, 2);

    await expect(
      build(stock).execute({
        sku: 'SKU-1',
        quantity: 5,
        motive: Motive.SALE,
        idempotencyKey: 'key-3',
      }),
    ).rejects.toThrow(InsufficientStockError);

    expect(stock.movements).toHaveLength(0);
  });

  it('throws VariantNotFoundError when the SKU does not exist', async () => {
    const stock = new InMemoryStockRepository();

    await expect(
      build(stock).execute({
        sku: 'UNKNOWN',
        quantity: 1,
        motive: Motive.PURCHASE,
        idempotencyKey: 'key-4',
      }),
    ).rejects.toThrow(VariantNotFoundError);
  });

  it('rejects a non-positive quantity', async () => {
    const stock = new InMemoryStockRepository();

    await expect(
      build(stock).execute({
        sku: 'SKU-1',
        quantity: 0,
        motive: Motive.PURCHASE,
        idempotencyKey: 'key-5',
      }),
    ).rejects.toThrow(InvalidQuantityError);
  });

  it('applies a movement only once for the same idempotency key', async () => {
    const stock = new InMemoryStockRepository();
    stock.seed(variant.id, 0);
    const useCase = build(stock);

    await useCase.execute({
      sku: 'SKU-1',
      quantity: 5,
      motive: Motive.PURCHASE,
      idempotencyKey: 'key-dup',
    });

    await expect(
      useCase.execute({
        sku: 'SKU-1',
        quantity: 5,
        motive: Motive.PURCHASE,
        idempotencyKey: 'key-dup',
      }),
    ).rejects.toThrow(MovementAlreadyProcessedError);

    expect(stock.movements).toHaveLength(1);
    await expect(stock.getAvailable(variant.id)).resolves.toBe(5);
  });

  it('applies separate movements for different idempotency keys', async () => {
    const stock = new InMemoryStockRepository();
    stock.seed(variant.id, 0);
    const useCase = build(stock);

    await useCase.execute({
      sku: 'SKU-1',
      quantity: 5,
      motive: Motive.PURCHASE,
      idempotencyKey: 'key-a',
    });
    await useCase.execute({
      sku: 'SKU-1',
      quantity: 5,
      motive: Motive.PURCHASE,
      idempotencyKey: 'key-b',
    });

    expect(stock.movements).toHaveLength(2);
    await expect(stock.getAvailable(variant.id)).resolves.toBe(10);
  });
});
