import type { Variant } from '../../models/variant.js';

export const VARIANT_REPOSITORY = Symbol('VARIANT_REPOSITORY');

export interface VariantRepository {
  findById(id: string): Promise<Variant | null>;
  findBySku(sku: string): Promise<Variant | null>;
}
