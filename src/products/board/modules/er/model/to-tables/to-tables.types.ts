import type { TableDraft } from "./tables-context.types";

/** How a hierarchy becomes tables: one per entity (children keyed by the parent) or one for all. */
export type ErHierarchyStrategy = "per-entity" | "single";

export interface ErTableOptions {
  /** Each hierarchy's strategy, by its id; `per-entity` when not given. */
  hierarchies?: Readonly<Record<string, ErHierarchyStrategy>>;
  /** A column's current type when its table already exists (kept instead of the guess). */
  existingType?: (table: string, column: string) => string | undefined;
}

/** The tables a diagram becomes, before writing them: what the ER forms show. */
export interface ErTablesModel {
  tables: TableDraft[];
  /** The table an ER shape (entity, aggregation, associative relation) became, by shape id. */
  tableOf: ReadonlyMap<string, string>;
}

/** A diagram as tables: the DBML to apply, the tables it writes and what to know about it. */
export interface ErTablesResult {
  dbml: string;
  tables: string[];
  warnings: string[];
}
