import type { DbCardElement } from "../card";

/** DBML relation kind, read from the owning column: `>` many-to-one, `<` one-to-many, `-` one-to-one, `<>` many-to-many. */
export type DbRefKind = ">" | "<" | "-" | "<>";

/** Relation from the owning column to a target column, by id so renames and moves never break it. */
export interface DbRef {
  tableId: string;
  columnId: string;
  kind: DbRefKind;
}

export interface DbColumn {
  id: string;
  name: string;
  /** Type name without its arguments, e.g. `varchar` (see `formatColumnType`). */
  type: string;
  /** Type arguments, e.g. `255` or `10, 2`; `""` for none. */
  typeArgs: string;
  pk: boolean;
  increment: boolean;
  notNull: boolean;
  unique: boolean;
  /** Raw DBML default value (e.g. `0`, `'draft'`, `` `now()` ``), or `null` for none. */
  default: string | null;
  note: string;
  ref: DbRef | null;
}

/** A column (by id, so renames survive) or a raw expression such as `` `lower(email)` ``. */
export type DbIndexPart = { kind: "column"; columnId: string } | { kind: "expr"; expr: string };

export interface DbIndex {
  id: string;
  parts: DbIndexPart[];
  pk: boolean;
  unique: boolean;
  name: string;
  /** Index method (`btree`, `hash`, …), or empty for the database default. */
  type: string;
  note: string;
}

/** One table of the board's database schema. Its size is derived from the columns. */
export interface DbTableElement extends DbCardElement {
  type: "db-table";
  note: string;
  /** The note bubbles are collapsed to their icon (view state, not an undo step). */
  noteHidden: boolean;
  columns: DbColumn[];
  indexes: DbIndex[];
}
