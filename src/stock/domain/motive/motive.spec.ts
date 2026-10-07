import { Direction, deltaOf, directionOf, Motive } from './motive.js';

describe('motive', () => {
  it('maps each motive to its direction', () => {
    expect(directionOf(Motive.PURCHASE)).toBe(Direction.IN);
    expect(directionOf(Motive.RETURN)).toBe(Direction.IN);
    expect(directionOf(Motive.ADJUSTMENT_IN)).toBe(Direction.IN);
    expect(directionOf(Motive.SALE)).toBe(Direction.OUT);
    expect(directionOf(Motive.LOSS)).toBe(Direction.OUT);
    expect(directionOf(Motive.ADJUSTMENT_OUT)).toBe(Direction.OUT);
  });

  it('produces a positive delta for inbound motives', () => {
    expect(deltaOf(Motive.PURCHASE, 5)).toBe(5);
  });

  it('produces a negative delta for outbound motives', () => {
    expect(deltaOf(Motive.SALE, 5)).toBe(-5);
  });
});
