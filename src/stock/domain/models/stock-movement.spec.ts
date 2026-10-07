import { InvalidQuantityError } from '../errors/invalid-quantity.error.js';
import { assertPositiveQuantity } from './stock-movement.js';

describe('assertPositiveQuantity', () => {
  it('accepts a positive integer', () => {
    expect(() => assertPositiveQuantity(3)).not.toThrow();
  });

  it.each([0, -1, 2.5])('rejects %s', (quantity) => {
    expect(() => assertPositiveQuantity(quantity)).toThrow(InvalidQuantityError);
  });
});
