import { createId } from "@shared/core";

import { DB_HEADER_COLORS } from "../../../palette";
import {
  tableSize,
  type DbColumn,
  type DbIndex,
  type DbRefKind,
  type DbTableElement,
} from "../table";
import type { ParsedEndpoint, ParsedIndex, ParsedRef, ParsedTable } from "./dbml";
import { pairByName } from "./pair-by-name";
import { ReconcileError } from "./reconcile-error";

const FLIPPED: Record<DbRefKind, DbRefKind> = { ">": "<", "<": ">", "-": "-", "<>": "<>" };

/** A table's final content; columns keep their ids when matched by name (or position). */
export function buildTable(
  parsed: ParsedTable,
  existing: DbTableElement | undefined,
): DbTableElement {
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
  const indexes = parsed.indexes.map((index, i) =>
    buildIndex(index, columns, existing?.indexes[i]?.id, parsed.name),
  );
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
    noteHidden: existing?.noteHidden ?? false,
    columns,
    indexes,
  };
}

function buildIndex(
  parsed: ParsedIndex,
  columns: readonly DbColumn[],
  id: string | undefined,
  tableName: string,
): DbIndex {
  const parts = parsed.parts.map((part) => {
    if (part.kind === "expr") return part;
    const column = columns.find((c) => c.name === part.column);
    if (!column) {
      throw new ReconcileError(
        `Index uses unknown column "${tableName}.${part.column}"`,
        parsed.line,
      );
    }
    return { kind: "column" as const, columnId: column.id };
  });
  const { pk, unique, name, type, note } = parsed;
  return { id: id ?? createId(), parts, pk, unique, name, type, note };
}

/** Writes each parsed ref onto the column that owns it (the end that belongs to an edited table). */
export function applyRefs(
  refs: readonly ParsedRef[],
  parsedTables: readonly ParsedTable[],
  tables: readonly DbTableElement[],
  others: readonly DbTableElement[],
): void {
  const lookup = new Map<string, DbTableElement>();
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
  lookup: ReadonlyMap<string, DbTableElement>,
  line: number,
): { table: DbTableElement; column: DbColumn } {
  const table = lookup.get(endpoint.table);
  if (!table) {
    throw new ReconcileError(
      `Unknown table "${endpoint.table}". It's created when you leave the editor`,
      line,
    );
  }
  const column = table.columns.find((c) => c.name === endpoint.column);
  if (!column)
    throw new ReconcileError(`Unknown column "${endpoint.table}.${endpoint.column}"`, line);
  return { table, column };
}
