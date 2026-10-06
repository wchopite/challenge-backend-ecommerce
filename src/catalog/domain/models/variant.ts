export interface Variant {
  readonly id: string;
  readonly sku: string;
  readonly productId: string;
  readonly attributes: Readonly<Record<string, string>>;
}
