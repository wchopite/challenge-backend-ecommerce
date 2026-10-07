import { DomainError } from '../../../shared/domain/errors/domain.error.js';

export class InsufficientStockError extends DomainError {
  constructor(
    readonly available: number,
    readonly requested: number,
  ) {
    super(`Insufficient stock: available ${available}, requested ${requested}`, 'CONFLICT');
  }
}
