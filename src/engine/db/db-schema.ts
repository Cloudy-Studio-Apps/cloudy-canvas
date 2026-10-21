import {
  isDbTable,
  type BoardDocument,
  type DbColumn,
  type DbRef,
  type DbTableShape,
} from "../document";
import { Emitter } from "../utils";
import { applyPlan } from "./apply-plan";
import { createDbColumn } from "./create-db-table";
import { parseDbml, serializeSchema, serializeTable } from "./dbml";
import { pruneRefs } from "./prune-refs";
import { reconcile } from "./reconcile";
import { tableSize } from "./table-layout";
import type {
  ColumnTarget,
  DbApplyResult,
  DbColumnPatch,
  DbTablePatch,
  IncomingRef,
} from "./db-schema.types";

/**
 * The board's database schema: every `db-table` shape together. Reads it as DBML and applies edits
 * (from DBML text or the visual editor) back to the document. Each edit is one undo step.
 */
export class DbSchema {
  private readonly emitter = new Emitter();
  private version = 0;
  private readonly unobserve: () => void;

  constructor(private readonly doc: BoardDocument) {
    this.unobserve = doc.observe((change) => {
      // Removed ids can't be checked any more, so any removal counts as a schema change.
      const touched =
        change.removed.size > 0 || [...change.updated].some((id) => isDbTable(doc.get(id)));
      if (!touched) return;
      this.version++;
      this.emitter.emit();
    });
  }

  /** Notifies when any table changes (works with React's `useSyncExternalStore`). */
  subscribe = (listener: () => void): (() => void) => this.emitter.subscribe(listener);

  /** Increments on every table change. */
  getVersion = (): number => this.version;

  destroy(): void {
    this.unobserve();
    this.emitter.clear();
  }

  tables(): DbTableShape[] {
    return this.doc.all().filter(isDbTable);
  }

  table(id: string): DbTableShape | undefined {
    const shape = this.doc.get(id);
    return isDbTable(shape) ? shape : undefined;
  }

  /** `base`, or `base_2`, `base_3`, … when the name is taken. */
  uniqueName(base = "table"): string {
    const names = new Set(this.tables().map((table) => table.name));
    if (!names.has(base)) return base;
    let n = 2;
    while (names.has(`${base}_${n}`)) n++;
    return `${base}_${n}`;
  }

  // ── DBML ────────────────────────────────────────────────────────────

  schemaDbml(): string {
    return serializeSchema(this.tables());
  }

  tableDbml(id: string): string {
    const table = this.table(id);
    if (!table) return "";
    return serializeTable(table, new Map(this.tables().map((t) => [t.id, t])));
  }

  /** Replaces the whole schema: tables are updated, created (placed next to the content) or removed. */
  applySchemaDbml(text: string): DbApplyResult {
    const parsed = parseDbml(text);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const result = reconcile({ schema: parsed.schema, replaced: this.tables(), others: [] });
    if (!result.ok) return result;
    applyPlan(this.doc, result.plan);
    return { ok: true, warnings: parsed.schema.warnings };
  }

  /** Merges a DBML file into the board: tables with the same name are updated, others are added. */
  importSchemaDbml(text: string): DbApplyResult {
    const parsed = parseDbml(text);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const names = new Set(parsed.schema.tables.map((table) => table.name));
    const tables = this.tables();
    const result = reconcile({
      schema: parsed.schema,
      replaced: tables.filter((table) => names.has(table.name)),
      others: tables.filter((table) => !names.has(table.name)),
    });
    if (!result.ok) return result;
    applyPlan(this.doc, result.plan);
    return { ok: true, warnings: parsed.schema.warnings };
  }

  /** Replaces one table from its DBML slice, which must define exactly that one table. */
  applyTableDbml(id: string, text: string): DbApplyResult {
    const table = this.table(id);
    if (!table) return failure("This table no longer exists");
    const parsed = parseDbml(text);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    if (parsed.schema.tables.length !== 1) {
      return failure("Write exactly one Table here. Use the Schema view to add or remove tables");
    }
    const others = this.tables().filter((t) => t.id !== id);
    const result = reconcile({ schema: parsed.schema, replaced: [table], others });
    if (!result.ok) return result;
    applyPlan(this.doc, result.plan);
    return { ok: true, warnings: parsed.schema.warnings };
  }

  // ── Visual edits ──────────────────────────────────────────────────────

  /** Returns an error message when the new name is empty or taken. */
  updateTable(id: string, patch: DbTablePatch): string | null {
    const table = this.table(id);
    if (!table) return null;
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) return "A table needs a name";
      if (this.tables().some((t) => t.id !== id && t.name === name))
        return `"${name}" is already used`;
      patch = { ...patch, name };
    }
    this.doc.checkpoint();
    const next = { ...table, ...patch };
    this.doc.update(id, { ...patch, ...tableSize(next.name, next.columns) });
    return null;
  }

  /** Adds a column and returns its id. */
  addColumn(tableId: string): string | null {
    const table = this.table(tableId);
    if (!table) return null;
    const names = new Set(table.columns.map((c) => c.name));
    let name = "column";
    for (let n = 2; names.has(name); n++) name = `column_${n}`;
    const column = createDbColumn(name, "varchar");
    this.writeColumns(table, [...table.columns, column]);
    return column.id;
  }

  /** Returns an error message when a rename is empty or clashes with another column. */
  updateColumn(tableId: string, columnId: string, patch: DbColumnPatch): string | null {
    const table = this.table(tableId);
    if (!table) return null;
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) return "A column needs a name";
      if (table.columns.some((c) => c.id !== columnId && c.name === name))
        return `"${name}" is already used`;
      patch = { ...patch, name };
    }
    if (patch.type !== undefined && !patch.type.trim()) return "A column needs a type";
    this.writeColumns(
      table,
      table.columns.map((c) => (c.id === columnId ? { ...c, ...patch } : c)),
    );
    return null;
  }

  moveColumn(tableId: string, columnId: string, toIndex: number): void {
    const table = this.table(tableId);
    const from = table?.columns.findIndex((c) => c.id === columnId) ?? -1;
    if (!table || from < 0 || from === toIndex) return;
    const columns = [...table.columns];
    const [column] = columns.splice(from, 1);
    columns.splice(Math.max(0, Math.min(toIndex, columns.length)), 0, column!);
    this.writeColumns(table, columns);
  }

  /** Removes a column and any relation pointing at it. */
  removeColumn(tableId: string, columnId: string): void {
    const table = this.table(tableId);
    if (!table) return;
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.writeColumns(
        table,
        table.columns.filter((c) => c.id !== columnId),
        false,
      );
      pruneRefs(this.doc);
    });
  }

  setColumnRef(tableId: string, columnId: string, ref: DbRef | null): void {
    const table = this.table(tableId);
    if (!table) return;
    this.writeColumns(
      table,
      table.columns.map((c) => (c.id === columnId ? { ...c, ref } : c)),
    );
  }

  /** Removes shapes, plus the relations that pointed at removed tables, as one undo step. */
  removeShapes(ids: Iterable<string>): void {
    const list = [...ids];
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.doc.remove(list);
      pruneRefs(this.doc);
    });
  }

  // ── Queries ─────────────────────────────────────────────────────────

  incomingRefs(tableId: string): IncomingRef[] {
    const target = this.table(tableId);
    if (!target) return [];
    const result: IncomingRef[] = [];
    for (const table of this.tables()) {
      for (const column of table.columns) {
        if (column.ref?.tableId !== tableId) continue;
        const targetColumn = target.columns.find((c) => c.id === column.ref!.columnId);
        if (targetColumn) result.push({ table, column, target: targetColumn, ref: column.ref });
      }
    }
    return result;
  }

  /** Every column on the board, for the relation picker. */
  columnTargets(): ColumnTarget[] {
    return this.tables().flatMap((table) =>
      table.columns.map((column) => ({
        tableId: table.id,
        tableName: table.name,
        columnId: column.id,
        columnName: column.name,
        type: column.type,
        pk: column.pk,
      })),
    );
  }

  // ── Internals ─────────────────────────────────────────────────────────

  private writeColumns(table: DbTableShape, columns: DbColumn[], checkpoint = true): void {
    if (checkpoint) this.doc.checkpoint();
    this.doc.update(table.id, { columns, ...tableSize(table.name, columns) });
  }
}

function failure(message: string): DbApplyResult {
  return { ok: false, error: { message, line: 1, column: 1 } };
}
