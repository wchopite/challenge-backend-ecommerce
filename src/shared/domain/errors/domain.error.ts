export type DomainErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'INVALID_ARGUMENT';

export abstract class DomainError extends Error {
  protected constructor(
    message: string,
    readonly code: DomainErrorCode,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
