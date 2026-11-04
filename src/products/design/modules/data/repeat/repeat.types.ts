import type { DataCondition } from "../bindings";
import type { DataField } from "../source";

/** One sort rule: a path read in the row's scope (`item.price`). */
export interface SortRule {
  path: string;
  descending?: boolean;
}

/** What a frame repeats: its first child is the template, shown once per row of a list. */
export interface RepeatSettings {
  /** An expression for a list in scope: `products`, `product.specs`, `page.rows`. */
  source: string;
  /** The row's name inside the template, `item` by default. */
  as: string;
  /** A path read in the row's scope (`item.id`) giving each row's identity; else the position. */
  key?: string;
  /** All must hold for a row to show. */
  filter: DataCondition[];
  sort: SortRule[];
  /** Caps the rows everywhere (document and export). */
  limit?: number;
  /** Caps the copies made in the document only. */
  designLimit?: number;
  /** The row the template itself shows (0 when unset). */
  previewRow?: number;
  /** Row keys of detached copies: never updated or replaced. */
  detached: string[];
}

/** What a copy of the template carries: which iterator made it, for which row, from which child. */
export interface DataCopyTag {
  iterator: string;
  key: string;
  /** The template child's id. */
  source: string;
}

/** The rows an iterator gives. */
export interface RepeatRow {
  key: string;
  row: unknown;
  /** The row's position in the shown list. */
  index: number;
}

export interface RepeatRows {
  rows: RepeatRow[];
  /** The rows before `designLimit`. */
  total: number;
}

/** What a row name carries into its scope. */
export interface RowNames {
  fields: Map<string, DataField>;
  sources: Map<string, string>;
}
