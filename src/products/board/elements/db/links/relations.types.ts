import type { DbEnumElement } from "../enum";
import type { DbRefKind, DbTableElement } from "../table";

/** A column ref resolved against the tables currently on the board. */
export interface Relation {
  /** Table that owns the ref, and the owning column's row. */
  from: DbTableElement;
  fromRow: number;
  to: DbTableElement;
  toRow: number;
  kind: DbRefKind;
}

/** A column typed with an enum on the board. */
export interface EnumLink {
  table: DbTableElement;
  row: number;
  target: DbEnumElement;
}
