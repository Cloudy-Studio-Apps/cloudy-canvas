import type { CanvasDocument, ElementPatch } from "@canvas";
import { createId } from "@shared/core";

import {
  createDbColumn,
  isDbTable,
  normalizeTypeArgs,
  splitColumnType,
  tableSize,
  type DbColumn,
  type DbIndex,
  type DbTableElement,
} from "../table";
import { pruneRefs } from "./prune-refs";
import type { DbColumnPatch, DbIndexPatch, DbTablePatch } from "./db-schema.types";
import { patchTable } from "./patch-db-element";

// Visual edits to one table. Each is one undo step. Functions that validate return an error message.

function getTable(doc: CanvasDocument, id: string): DbTableElement | undefined {
  const shape = doc.get(id);
  return isDbTable(shape) ? shape : undefined;
}

export function updateTable(doc: CanvasDocument, id: string, patch: DbTablePatch): string | null {
  const table = getTable(doc, id);
  if (!table) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) return "A table needs a name";
    const taken = doc.all().some((s) => isDbTable(s) && s.id !== id && s.name === name);
    if (taken) return `"${name}" is already used`;
    patch = { ...patch, name };
  }
  doc.checkpoint();
  const next = { ...table, ...patch };
  patchTable(doc, id, { ...patch, ...tableSize(next.name, next.columns) });
  return null;
}

/** Adds a column and returns its id. */
export function addColumn(doc: CanvasDocument, tableId: string): string | null {
  const table = getTable(doc, tableId);
  if (!table) return null;
  const column = createDbColumn(freeName(table.columns, "column"), "varchar");
  writeColumns(doc, table, [...table.columns, column]);
  return column.id;
}

export function updateColumn(
  doc: CanvasDocument,
  tableId: string,
  columnId: string,
  patch: DbColumnPatch,
): string | null {
  const table = getTable(doc, tableId);
  if (!table) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) return "A column needs a name";
    if (table.columns.some((c) => c.id !== columnId && c.name === name))
      return `"${name}" is already used`;
    patch = { ...patch, name };
  }
  if (patch.type !== undefined) {
    // `varchar(255)` typed as the type sets the arguments too.
    const { type, typeArgs } = splitColumnType(patch.type);
    if (!type) return "A column needs a type";
    patch = { ...patch, type, ...(typeArgs && { typeArgs }) };
  }
  if (patch.typeArgs !== undefined)
    patch = { ...patch, typeArgs: normalizeTypeArgs(patch.typeArgs) };
  writeColumns(
    doc,
    table,
    table.columns.map((c) => (c.id === columnId ? { ...c, ...patch } : c)),
  );
  return null;
}

export function moveColumn(
  doc: CanvasDocument,
  tableId: string,
  columnId: string,
  toIndex: number,
): void {
  const table = getTable(doc, tableId);
  const from = table?.columns.findIndex((c) => c.id === columnId) ?? -1;
  if (!table || from < 0 || from === toIndex) return;
  writeColumns(doc, table, moveItem(table.columns, from, toIndex));
}

/** Removes a column, the relations pointing at it and its place in indexes. */
export function removeColumn(doc: CanvasDocument, tableId: string, columnId: string): void {
  const table = getTable(doc, tableId);
  if (!table) return;
  doc.checkpoint();
  doc.batch(() => {
    writeColumns(
      doc,
      table,
      table.columns.filter((c) => c.id !== columnId),
      false,
    );
    pruneRefs(doc);
  });
}

export function setColumnRef(
  doc: CanvasDocument,
  tableId: string,
  columnId: string,
  ref: DbColumn["ref"],
): void {
  const table = getTable(doc, tableId);
  if (!table) return;
  writeColumns(
    doc,
    table,
    table.columns.map((c) => (c.id === columnId ? { ...c, ref } : c)),
  );
}

/** Adds an index on `columnId` (or the first column) and returns its id. */
export function addIndex(doc: CanvasDocument, tableId: string, columnId?: string): string | null {
  const table = getTable(doc, tableId);
  const column = columnId ?? table?.columns[0]?.id;
  if (!table || !column) return null;
  const index: DbIndex = {
    id: createId(),
    parts: [{ kind: "column", columnId: column }],
    pk: false,
    unique: false,
    name: "",
    type: "",
    note: "",
  };
  doc.checkpoint();
  patchTable(doc, tableId, { indexes: [...table.indexes, index] });
  return index.id;
}

export function updateIndex(
  doc: CanvasDocument,
  tableId: string,
  indexId: string,
  patch: DbIndexPatch,
): void {
  const table = getTable(doc, tableId);
  if (!table) return;
  doc.checkpoint();
  const indexes = table.indexes
    .map((index) => (index.id === indexId ? { ...index, ...patch } : index))
    .filter((index) => index.parts.length > 0);
  patchTable(doc, tableId, { indexes });
}

export function removeIndex(doc: CanvasDocument, tableId: string, indexId: string): void {
  const table = getTable(doc, tableId);
  if (!table) return;
  doc.checkpoint();
  patchTable(doc, tableId, { indexes: table.indexes.filter((index) => index.id !== indexId) });
}

/** Hiding or showing the note bubble is view state, so it isn't an undo step. */
export function setNoteHidden(doc: CanvasDocument, tableId: string, noteHidden: boolean): void {
  const patch: ElementPatch<DbTableElement> = { noteHidden };
  doc.updateUntracked(tableId, patch);
}

/** Writes new columns with the size they need; indexes drop parts whose column is gone. */
function writeColumns(
  doc: CanvasDocument,
  table: DbTableElement,
  columns: DbColumn[],
  checkpoint = true,
): void {
  if (checkpoint) doc.checkpoint();
  const ids = new Set(columns.map((c) => c.id));
  const indexes = table.indexes
    .map((index) => ({
      ...index,
      parts: index.parts.filter((part) => part.kind === "expr" || ids.has(part.columnId)),
    }))
    .filter((index) => index.parts.length > 0);
  patchTable(doc, table.id, { columns, indexes, ...tableSize(table.name, columns) });
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item!);
  return next;
}

/** `base`, or `base_2`, `base_3`, … when the name is taken. */
export function freeName(items: readonly { name: string }[], base: string): string {
  const names = new Set(items.map((item) => item.name));
  if (!names.has(base)) return base;
  let n = 2;
  while (names.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}
