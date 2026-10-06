export interface CatalogVariant {
  readonly id: string;
  readonly sku: string;
  readonly productId: string;
}

export const CATALOG_READER = Symbol('CATALOG_READER');

export interface CatalogReader {
  getVariant(sku: string): Promise<CatalogVariant | null>;
}
