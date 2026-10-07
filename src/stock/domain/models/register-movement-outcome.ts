export const MovementStatus = {
  APPLIED: 'applied',
  INSUFFICIENT: 'insufficient',
  DUPLICATE: 'duplicate',
} as const;

export type MovementStatus = (typeof MovementStatus)[keyof typeof MovementStatus];

export type RegisterMovementOutcome =
  | { readonly status: typeof MovementStatus.APPLIED; readonly available: number }
  | { readonly status: typeof MovementStatus.INSUFFICIENT; readonly available: number }
  | { readonly status: typeof MovementStatus.DUPLICATE };
