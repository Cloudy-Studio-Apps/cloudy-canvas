import type { DataField } from "../source";

/**
 * Names that expressions can start with, and the scope around them. `fields` maps a normalized
 * expression (`fieldKey`: `products[].price`, `product.price`) to its field, for formats and types.
 */
export interface DataScope {
  names: Record<string, unknown>;
  parent: DataScope | null;
  fields: Map<string, DataField>;
}

/** What an expression reads: its value and, when it is a source's field, that field. */
export interface LookupResult {
  value: unknown;
  field: DataField | null;
}

/** A name a picker can offer. */
export interface ScopeName {
  expr: string;
  field: DataField | null;
}
