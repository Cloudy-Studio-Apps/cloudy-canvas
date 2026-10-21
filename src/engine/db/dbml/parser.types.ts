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

export interface ParsedTable {
  name: string;
  alias: string | null;
  headerColor: string | null;
  note: string;
  columns: ParsedColumn[];
  line: number;
}

export interface ParsedSchema {
  tables: ParsedTable[];
  /** Inline column refs and top-level `Ref:` lines, in source order. */
  refs: ParsedRef[];
  /** Constructs that were recognized but aren't supported yet, and were skipped. */
  warnings: DbmlError[];
}

export type ParseResult = { ok: true; schema: ParsedSchema } | { ok: false; error: DbmlError };
