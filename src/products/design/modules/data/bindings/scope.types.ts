import type { DataField } from "../source";

/**
 * Names that expressions can start with, and the scope around them. `fields` maps a normalized
 * expression (`fieldKey`: `products[].price`, `product.price`) to its field, for formats and types.
 */
export interface DataScope {
  names: Record<string, unknown>;
  parent: DataScope | null;
  fields: Map<string, DataField>;
  /** The source each name's data comes from (name → source id): pictures are found per source. */
  sources: ReadonlyMap<string, string>;
  /**
   * Names of sources whose data can't be read here (the snapshot's asset missing or broken):
   * left out of `names`, and what reads them is left alone rather than blanked.
   */
  unreadable: ReadonlySet<string>;
}

/** What an expression reads: its value and, when it is a source's field, that field. */
export interface LookupResult {
  value: unknown;
  field: DataField | null;
  /** The id of the source the value comes from, `null` when it isn't a source's. */
  source: string | null;
}

/** A name a picker can offer. */
export interface ScopeName {
  expr: string;
  field: DataField | null;
}
