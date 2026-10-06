import { Inject, Injectable } from '@nestjs/common';
import type { CatalogReader, CatalogVariant } from '../../domain/ports/in/catalog-reader.js';
import {
  VARIANT_REPOSITORY,
  type VariantRepository,
} from '../../domain/ports/out/variant.repository.js';

@Injectable()
export class GetVariantUseCase implements CatalogReader {
  constructor(
    @Inject(VARIANT_REPOSITORY)
    private readonly variants: VariantRepository,
  ) {}

  async getVariant(sku: string): Promise<CatalogVariant | null> {
    const variant = await this.variants.findBySku(sku);

    if (variant === null) {
      return null;
    }

    return {
      id: variant.id,
      sku: variant.sku,
      productId: variant.productId,
    };
  }
}
