/** How a hierarchy becomes tables: one per entity (children keyed by the parent) or one for all. */
export type ErHierarchyStrategy = "per-entity" | "single";

export interface ErTableOptions {
  /** Each hierarchy's strategy, by its id; `per-entity` when not given. */
  hierarchies?: Readonly<Record<string, ErHierarchyStrategy>>;
  /** A column's current type when its table already exists (kept instead of the guess). */
  existingType?: (table: string, column: string) => string | undefined;
}

/** A diagram as tables: the DBML to apply, the tables it writes and what to know about it. */
export interface ErTablesResult {
  dbml: string;
  tables: string[];
  warnings: string[];
}
