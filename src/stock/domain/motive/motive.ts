export const Motive = {
  PURCHASE: 'PURCHASE',
  RETURN: 'RETURN',
  ADJUSTMENT_IN: 'ADJUSTMENT_IN',
  SALE: 'SALE',
  LOSS: 'LOSS',
  ADJUSTMENT_OUT: 'ADJUSTMENT_OUT',
} as const;

export type Motive = (typeof Motive)[keyof typeof Motive];

export const Direction = {
  IN: 'IN',
  OUT: 'OUT',
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

const DIRECTION_BY_MOTIVE: Record<Motive, Direction> = {
  [Motive.PURCHASE]: Direction.IN,
  [Motive.RETURN]: Direction.IN,
  [Motive.ADJUSTMENT_IN]: Direction.IN,
  [Motive.SALE]: Direction.OUT,
  [Motive.LOSS]: Direction.OUT,
  [Motive.ADJUSTMENT_OUT]: Direction.OUT,
};

export function directionOf(motive: Motive): Direction {
  return DIRECTION_BY_MOTIVE[motive];
}

export function deltaOf(motive: Motive, quantity: number): number {
  return directionOf(motive) === Direction.IN ? quantity : -quantity;
}
