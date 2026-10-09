export const DomainErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
} as const;

export type DomainErrorCode = (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

export abstract class DomainError extends Error {
  protected constructor(
    message: string,
    readonly code: DomainErrorCode,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = new.target.name;
  }
}
