export interface VariantAvailability {
  readonly sku: string;
  readonly available: number;
}

export const GET_VARIANT_AVAILABILITY = Symbol('GET_VARIANT_AVAILABILITY');

export interface GetVariantAvailability {
  execute(sku: string): Promise<VariantAvailability>;
}
