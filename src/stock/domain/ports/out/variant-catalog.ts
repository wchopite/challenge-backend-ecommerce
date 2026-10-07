export interface VariantRef {
  readonly id: string;
  readonly sku: string;
}

export const VARIANT_CATALOG = Symbol('VARIANT_CATALOG');

export interface VariantCatalog {
  findBySku(sku: string): Promise<VariantRef | null>;
}
