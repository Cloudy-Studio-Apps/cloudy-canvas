import type { DbColumn, DbIndex, DbRef, DbTableElement } from "../table";
import type { DbEnumValue } from "../enum";
import type { DbmlError } from "./dbml";

export type DbApplyResult = { ok: true; warnings: DbmlError[] } | { ok: false; error: DbmlError };

export interface DbApplyOptions {
  /** Create the tables that refs name but nothing defines, instead of failing. */
  createMissingTables?: boolean;
}

export type DbTablePatch = Partial<Pick<DbTableElement, "name" | "headerColor" | "note">>;

export type DbColumnPatch = Partial<Omit<DbColumn, "id" | "ref">>;

export type DbIndexPatch = Partial<Omit<DbIndex, "id">>;

export type DbEnumPatch = Partial<{ name: string; headerColor: string }>;

export type DbEnumValuePatch = Partial<Omit<DbEnumValue, "id">>;

/** A column of another table that points at this one. */
export interface IncomingRef {
  table: DbTableElement;
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
  table: DbTableElement;
  column: DbColumn;
}
