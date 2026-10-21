import type { DbEnumShape, DbRefKind, DbTableShape } from "../document";

/** A column ref resolved against the tables currently on the board. */
export interface Relation {
  /** Table that owns the ref, and the owning column's row. */
  from: DbTableShape;
  fromRow: number;
  to: DbTableShape;
  toRow: number;
  kind: DbRefKind;
}

/** A column typed with an enum on the board. */
export interface EnumLink {
  table: DbTableShape;
  row: number;
  target: DbEnumShape;
}
