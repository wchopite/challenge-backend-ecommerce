import { DomainError } from '../../../shared/domain/errors/domain.error.js';

export class InvalidQuantityError extends DomainError {
  constructor(readonly quantity: number) {
    super(`Quantity must be a positive integer, got ${quantity}`, 'INVALID_ARGUMENT');
  }
}
