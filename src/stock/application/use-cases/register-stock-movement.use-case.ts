import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error.js';
import { VariantNotFoundError } from '../../domain/errors/variant-not-found.error.js';
import { assertPositiveQuantity, type StockMovement } from '../../domain/models/stock-movement.js';
import type {
  RegisterStockMovement,
  RegisterStockMovementInput,
  StockMovementResult,
} from '../../domain/ports/in/register-stock-movement.js';
import { STOCK_REPOSITORY, type StockRepository } from '../../domain/ports/out/stock.repository.js';
import { VARIANT_CATALOG, type VariantCatalog } from '../../domain/ports/out/variant-catalog.js';

@Injectable()
export class RegisterStockMovementUseCase implements RegisterStockMovement {
  constructor(
    @Inject(VARIANT_CATALOG) private readonly catalog: VariantCatalog,
    @Inject(STOCK_REPOSITORY) private readonly stock: StockRepository,
  ) {}

  async execute(input: RegisterStockMovementInput): Promise<StockMovementResult> {
    assertPositiveQuantity(input.quantity);

    const variant = await this.catalog.findBySku(input.sku);

    if (variant === null) {
      throw new VariantNotFoundError(input.sku);
    }

    const movement: StockMovement = {
      id: randomUUID(),
      variantId: variant.id,
      sku: variant.sku,
      quantity: input.quantity,
      motive: input.motive,
      occurredAt: new Date(),
    };

    const outcome = await this.stock.register(movement);

    if (outcome.status === 'insufficient') {
      throw new InsufficientStockError(outcome.available, input.quantity);
    }

    return {
      id: movement.id,
      sku: movement.sku,
      variantId: movement.variantId,
      quantity: movement.quantity,
      motive: movement.motive,
      available: outcome.available,
      occurredAt: movement.occurredAt,
    };
  }
}
