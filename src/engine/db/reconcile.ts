import { createId } from "@core";

import { DB_HEADER_COLORS, type DbColumn, type DbRefKind, type DbTableShape } from "../document";
import type { DbmlError, ParsedEndpoint, ParsedRef, ParsedTable } from "./dbml";
import { pairByName } from "./pair-by-name";
import { tableSize } from "./table-layout";
import type { ReconcileInput, ReconcileResult } from "./reconcile.types";

const FLIPPED: Record<DbRefKind, DbRefKind> = { ">": "<", "<": ">", "-": "-", "<>": "<>" };

class ReconcileError extends Error {
  constructor(
    message: string,
    readonly line: number,
  ) {
    super(message);
  }
}

/**
 * Works out how the board's tables change for a parsed DBML text. Tables and columns are matched
 * by name (then by position, for renames) so their ids, and the relations that point at them, survive.
 */
export function reconcile({ schema, replaced, others }: ReconcileInput): ReconcileResult {
  try {
    const otherNames = new Set(others.map((table) => table.name));
    const seen = new Set<string>();
    for (const table of schema.tables) {
      if (seen.has(table.name))
        throw new ReconcileError(`Table "${table.name}" is defined twice`, table.line);
      if (otherNames.has(table.name)) {
        throw new ReconcileError(
          `Another table on the board is already named "${table.name}"`,
          table.line,
        );
      }
      seen.add(table.name);
    }

    const pairs = pairByName(schema.tables, replaced);
    const added = new Set<string>();
    const tables = schema.tables.map((parsed, i) => {
      const existing = pairs.get(i);
      const table = buildTable(parsed, existing);
      if (!existing) added.add(table.id);
      return table;
    });
    const kept = new Set(tables.map((table) => table.id));
    const removed = replaced.filter((table) => !kept.has(table.id)).map((table) => table.id);

    applyRefs(schema.refs, schema.tables, tables, others);
    return { ok: true, plan: { tables, added, removed } };
  } catch (error) {
    if (error instanceof ReconcileError) return { ok: false, error: toDbmlError(error) };
    throw error;
  }
}

function buildTable(parsed: ParsedTable, existing: DbTableShape | undefined): DbTableShape {
  const names = new Set<string>();
  for (const column of parsed.columns) {
    if (names.has(column.name)) {
      throw new ReconcileError(
        `Column "${column.name}" is defined twice in "${parsed.name}"`,
        parsed.line,
      );
    }
    names.add(column.name);
  }
  const pairs = pairByName(parsed.columns, existing?.columns ?? []);
  const columns: DbColumn[] = parsed.columns.map((column, i) => ({
    id: pairs.get(i)?.id ?? createId(),
    ...column,
    ref: null,
  }));
  return {
    id: existing?.id ?? createId(),
    type: "db-table",
    index: existing?.index ?? "",
    x: existing?.x ?? 0,
    y: existing?.y ?? 0,
    ...tableSize(parsed.name, columns),
    name: parsed.name,
    headerColor: parsed.headerColor ?? DB_HEADER_COLORS[0].value,
    note: parsed.note,
    columns,
  };
}

/** Writes each parsed ref onto the column that owns it (the end that belongs to an edited table). */
function applyRefs(
  refs: readonly ParsedRef[],
  parsedTables: readonly ParsedTable[],
  tables: readonly DbTableShape[],
  others: readonly DbTableShape[],
): void {
  const lookup = new Map<string, DbTableShape>();
  for (const table of [...others, ...tables]) lookup.set(table.name, table);
  parsedTables.forEach((parsed, i) => {
    if (parsed.alias) lookup.set(parsed.alias, tables[i]!);
  });
  const edited = new Set(tables.map((table) => table.id));

  for (const ref of refs) {
    const from = resolve(ref.from, lookup, ref.line);
    const to = resolve(ref.to, lookup, ref.line);
    const ends = [
      { owner: from, target: to, kind: ref.kind },
      { owner: to, target: from, kind: FLIPPED[ref.kind] },
    ].filter((end) => edited.has(end.owner.table.id));
    if (ends.length === 0) {
      throw new ReconcileError("A ref here must start or end at this table", ref.line);
    }
    const end = ends.find((candidate) => !candidate.owner.column.ref);
    if (!end) {
      const { table, column } = ends[0]!.owner;
      throw new ReconcileError(
        `Column "${table.name}.${column.name}" already has a relation`,
        ref.line,
      );
    }
    end.owner.column.ref = {
      tableId: end.target.table.id,
      columnId: end.target.column.id,
      kind: end.kind,
    };
  }
}

function resolve(
  endpoint: ParsedEndpoint,
  lookup: ReadonlyMap<string, DbTableShape>,
  line: number,
): { table: DbTableShape; column: DbColumn } {
  const table = lookup.get(endpoint.table);
  if (!table) throw new ReconcileError(`Unknown table "${endpoint.table}"`, line);
  const column = table.columns.find((c) => c.name === endpoint.column);
  if (!column)
    throw new ReconcileError(`Unknown column "${endpoint.table}.${endpoint.column}"`, line);
  return { table, column };
}

function toDbmlError(error: ReconcileError): DbmlError {
  return { message: error.message, line: error.line, column: 1 };
}
