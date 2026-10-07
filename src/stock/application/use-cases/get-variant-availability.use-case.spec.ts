import { GetVariantAvailabilityUseCase } from './get-variant-availability.use-case.js';
import { VariantNotFoundError } from '../../domain/errors/variant-not-found.error.js';
import type { RegisterMovementOutcome } from '../../domain/models/register-movement-outcome.js';
import type { StockMovement } from '../../domain/models/stock-movement.js';
import type { StockRepository } from '../../domain/ports/out/stock.repository.js';
import type { VariantCatalog, VariantRef } from '../../domain/ports/out/variant-catalog.js';

class InMemoryVariantCatalog implements VariantCatalog {
  constructor(private readonly variants: readonly VariantRef[] = []) {}

  findBySku(sku: string): Promise<VariantRef | null> {
    return Promise.resolve(this.variants.find((variant) => variant.sku === sku) ?? null);
  }
}

class InMemoryStockRepository implements StockRepository {
  constructor(private readonly balances: ReadonlyMap<string, number> = new Map()) {}

  register(_movement: StockMovement): Promise<RegisterMovementOutcome> {
    throw new Error('register is not used in this test');
  }

  getAvailable(variantId: string): Promise<number> {
    return Promise.resolve(this.balances.get(variantId) ?? 0);
  }
}

describe('GetVariantAvailabilityUseCase', () => {
  const variant: VariantRef = { id: 'variant-1', sku: 'SKU-1' };

  it('returns the available quantity for an existing variant', async () => {
    const stock = new InMemoryStockRepository(new Map([[variant.id, 12]]));
    const useCase = new GetVariantAvailabilityUseCase(new InMemoryVariantCatalog([variant]), stock);

    await expect(useCase.execute('SKU-1')).resolves.toEqual({ sku: 'SKU-1', available: 12 });
  });

  it('returns zero when the variant has no stock recorded', async () => {
    const stock = new InMemoryStockRepository();
    const useCase = new GetVariantAvailabilityUseCase(new InMemoryVariantCatalog([variant]), stock);

    await expect(useCase.execute('SKU-1')).resolves.toEqual({ sku: 'SKU-1', available: 0 });
  });

  it('throws VariantNotFoundError when the SKU does not exist', async () => {
    const useCase = new GetVariantAvailabilityUseCase(
      new InMemoryVariantCatalog(),
      new InMemoryStockRepository(),
    );

    await expect(useCase.execute('UNKNOWN')).rejects.toThrow(VariantNotFoundError);
  });
});
