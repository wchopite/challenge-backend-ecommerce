import { Inject, Injectable } from '@nestjs/common';
import { CATALOG_READER } from '../../../catalog/domain/ports/in/catalog-reader.js';
import type { CatalogReader } from '../../../catalog/domain/ports/in/catalog-reader.js';
import type { VariantCatalog, VariantRef } from '../../domain/ports/out/variant-catalog.js';

@Injectable()
export class CatalogVariantAdapter implements VariantCatalog {
  constructor(@Inject(CATALOG_READER) private readonly catalog: CatalogReader) {}

  async findBySku(sku: string): Promise<VariantRef | null> {
    const variant = await this.catalog.getVariant(sku);

    if (variant === null) {
      return null;
    }

    return { id: variant.id, sku: variant.sku };
  }
}
