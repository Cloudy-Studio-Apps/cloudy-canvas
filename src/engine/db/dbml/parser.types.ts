import type { DbRefKind } from "../../document";

export interface DbmlError {
  message: string;
  line: number;
  column: number;
}

/** `table.column` as written in the source (table may be an alias). */
export interface ParsedEndpoint {
  table: string;
  column: string;
}

export interface ParsedRef {
  from: ParsedEndpoint;
  to: ParsedEndpoint;
  kind: DbRefKind;
  line: number;
}

export interface ParsedColumn {
  name: string;
  type: string;
  pk: boolean;
  increment: boolean;
  notNull: boolean;
  unique: boolean;
  default: string | null;
  note: string;
}

export type ParsedIndexPart = { kind: "column"; column: string } | { kind: "expr"; expr: string };

export interface ParsedIndex {
  parts: ParsedIndexPart[];
  pk: boolean;
  unique: boolean;
  name: string;
  type: string;
  note: string;
  line: number;
}

export interface ParsedTable {
  name: string;
  alias: string | null;
  headerColor: string | null;
  note: string;
  columns: ParsedColumn[];
  indexes: ParsedIndex[];
  line: number;
}

export interface ParsedEnum {
  name: string;
  headerColor: string | null;
  values: { name: string; note: string }[];
  line: number;
}

/** A top-level sticky note: `Note name { '…' }`. */
export interface ParsedNote {
  name: string;
  text: string;
  headerColor: string | null;
  line: number;
}

export interface ParsedSchema {
  tables: ParsedTable[];
  enums: ParsedEnum[];
  notes: ParsedNote[];
  /** Inline column refs and top-level `Ref:` lines, in source order. */
  refs: ParsedRef[];
  /** Constructs that were recognized but aren't supported yet, and were skipped. */
  warnings: DbmlError[];
}

export type ParseResult = { ok: true; schema: ParsedSchema } | { ok: false; error: DbmlError };
