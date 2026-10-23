import type { ErShapes } from "../lang";
import type { ErTableOptions } from "./to-tables.types";

export interface ColumnDraft {
  name: string;
  type: string;
  notNull?: boolean;
  unique?: boolean;
  /** A foreign key: the table and column it points at. */
  ref?: { table: string; column: string };
}

export interface TableDraft {
  name: string;
  columns: ColumnDraft[];
  /** The primary key's columns (several make a composite key). */
  pk: string[];
  /** Column groups that are unique (alternate keys). */
  uniques: string[][];
}

/** What the conversion builds up, step by step. */
export interface TablesContext {
  shapes: ErShapes;
  options: ErTableOptions;
  /** Tables by name, in the order they were made. */
  tables: Map<string, TableDraft>;
  /** The table an ER shape (entity, aggregation) became. */
  tableOf: Map<string, string>;
  /** Relations already turned into columns or tables (identifying ones, by their weak entity). */
  done: Set<string>;
  warnings: string[];
}

/** Columns made from attributes, and which of them are keys. */
export interface AttributeColumns {
  columns: ColumnDraft[];
  keys: string[];
  partialKeys: string[];
  /** Each alternate key's columns. */
  alternates: string[][];
}

export interface ForeignKeyOptions {
  notNull?: boolean;
  unique?: boolean;
  /** Point at this column of the target instead of its key (a join attribute). */
  only?: string | undefined;
}
