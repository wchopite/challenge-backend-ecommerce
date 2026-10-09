import { DomainError, DomainErrorCode } from '../../../shared/domain/errors/domain.error.js';

export class VariantNotFoundError extends DomainError {
  constructor(readonly sku: string) {
    super(`Variant not found for SKU ${sku}`, DomainErrorCode.NOT_FOUND, { sku });
  }
}
