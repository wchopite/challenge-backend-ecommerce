import { Inject, Injectable } from '@nestjs/common';
import { VariantNotFoundError } from '../../domain/errors/variant-not-found.error.js';
import type {
  GetVariantAvailability,
  VariantAvailability,
} from '../../domain/ports/in/get-variant-availability.js';
import { STOCK_REPOSITORY, type StockRepository } from '../../domain/ports/out/stock.repository.js';
import { VARIANT_CATALOG, type VariantCatalog } from '../../domain/ports/out/variant-catalog.js';

@Injectable()
export class GetVariantAvailabilityUseCase implements GetVariantAvailability {
  constructor(
    @Inject(VARIANT_CATALOG) private readonly catalog: VariantCatalog,
    @Inject(STOCK_REPOSITORY) private readonly stock: StockRepository,
  ) {}

  async execute(sku: string): Promise<VariantAvailability> {
    const variant = await this.catalog.findBySku(sku);

    if (variant === null) {
      throw new VariantNotFoundError(sku);
    }

    const available = await this.stock.getAvailable(variant.id);

    return { sku: variant.sku, available };
  }
}
