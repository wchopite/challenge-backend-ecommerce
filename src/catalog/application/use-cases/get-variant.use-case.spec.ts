import { GetVariantUseCase } from './get-variant.use-case.js';
import type { CatalogVariant } from '../../domain/ports/in/catalog-reader.js';
import type { Variant } from '../../domain/models/variant.js';
import type { VariantRepository } from '../../domain/ports/out/variant.repository.js';

class InMemoryVariantRepository implements VariantRepository {
  constructor(private readonly variants: readonly Variant[] = []) {}

  findById(id: string): Promise<Variant | null> {
    return Promise.resolve(this.variants.find((variant) => variant.id === id) ?? null);
  }

  findBySku(sku: string): Promise<Variant | null> {
    return Promise.resolve(this.variants.find((variant) => variant.sku === sku) ?? null);
  }
}

describe('GetVariantUseCase', () => {
  const variant: Variant = {
    id: 'variant-1',
    sku: 'SKU-1',
    productId: 'product-1',
    attributes: { size: '42', color: 'black' },
  };

  it('projects an existing variant into the published contract', async () => {
    const useCase = new GetVariantUseCase(new InMemoryVariantRepository([variant]));

    const result = await useCase.getVariant('SKU-1');

    const expected: CatalogVariant = {
      id: 'variant-1',
      sku: 'SKU-1',
      productId: 'product-1',
    };
    expect(result).toEqual(expected);
  });

  it('returns null when the variant does not exist', async () => {
    const useCase = new GetVariantUseCase(new InMemoryVariantRepository());

    const result = await useCase.getVariant('UNKNOWN-SKU');

    expect(result).toBeNull();
  });
});
