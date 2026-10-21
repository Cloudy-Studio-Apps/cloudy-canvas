import type { DbColumn, DbEnumValue, DbIndex, DbRef, DbTableShape } from "../document";
import type { DbmlError } from "./dbml";

export type DbApplyResult = { ok: true; warnings: DbmlError[] } | { ok: false; error: DbmlError };

export type DbTablePatch = Partial<Pick<DbTableShape, "name" | "headerColor" | "note">>;

export type DbColumnPatch = Partial<Omit<DbColumn, "id" | "ref">>;

export type DbIndexPatch = Partial<Omit<DbIndex, "id">>;

export type DbEnumPatch = Partial<{ name: string; headerColor: string }>;

export type DbEnumValuePatch = Partial<Omit<DbEnumValue, "id">>;

/** A column of another table that points at this one. */
export interface IncomingRef {
  table: DbTableShape;
  column: DbColumn;
  /** The column of this table it points at. */
  target: DbColumn;
  ref: DbRef;
}

/** A column anywhere on the board that a relation can point at. */
export interface ColumnTarget {
  tableId: string;
  tableName: string;
  columnId: string;
  columnName: string;
  type: string;
  pk: boolean;
}

/** A column whose type is an enum. */
export interface EnumUsage {
  table: DbTableShape;
  column: DbColumn;
}
