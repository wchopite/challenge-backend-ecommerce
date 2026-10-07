import { DomainError, DomainErrorCode } from '../../../shared/domain/errors/domain.error.js';

export class MovementAlreadyProcessedError extends DomainError {
  constructor(readonly idempotencyKey: string) {
    super(
      `A movement was already registered for idempotency key ${idempotencyKey}`,
      DomainErrorCode.CONFLICT,
    );
  }
}
