import { DocumentFeed, type CanvasDocument } from "@canvas";

import { isDbEnum, type DbEnumElement } from "../enum";
import { isDbTable, type DbRef, type DbTableElement } from "../table";
import { serializeEnum, serializeSchema, serializeTable } from "./dbml";
import * as enums from "./enum-edits";
import { connectedGroup, schemaGraph, tidySchema } from "./layout";
import { applyEnumText, applySchemaText, applyTableText, importSchemaText } from "./schema-dbml";
import { columnTargets, enumUsages, incomingRefs } from "./schema-queries";
import { isSchemaShape, schemaShapes } from "./schema-shapes";
import * as tables from "./table-edits";
import type {
  ColumnTarget,
  DbApplyOptions,
  DbApplyResult,
  DbColumnPatch,
  DbEnumPatch,
  DbEnumValuePatch,
  DbIndexPatch,
  DbTablePatch,
  EnumUsage,
  IncomingRef,
} from "./db-schema.types";

/**
 * The board's database schema: every table, enum and linked sticky note together. Reads it as DBML
 * and applies edits (from DBML text or the visual editor) back to the document. Each edit is one
 * undo step. The logic lives in `schema-dbml`, `table-edits` and `enum-edits`; this is the facade.
 */
export class DbSchema {
  private readonly feed: DocumentFeed;

  constructor(private readonly doc: CanvasDocument) {
    // Removed ids can't be checked any more, so any removal counts as a schema change.
    this.feed = new DocumentFeed(
      doc,
      (change) =>
        change.removed.size > 0 || [...change.updated].some((id) => isSchemaShape(doc.get(id))),
    );
  }

  /** Notifies when the schema changes (works with React's `useSyncExternalStore`). */
  subscribe = (listener: () => void): (() => void) => this.feed.subscribe(listener);

  /** Increments on every schema change. */
  getVersion = (): number => this.feed.getVersion();

  // ── Reading ─────────────────────────────────────────────────────────

  tables(): DbTableElement[] {
    return this.doc.all().filter(isDbTable);
  }

  enums(): DbEnumElement[] {
    return this.doc.all().filter(isDbEnum);
  }

  table(id: string): DbTableElement | undefined {
    const shape = this.doc.get(id);
    return isDbTable(shape) ? shape : undefined;
  }

  enum(id: string): DbEnumElement | undefined {
    const shape = this.doc.get(id);
    return isDbEnum(shape) ? shape : undefined;
  }

  /** `base`, or `base_2`, … when a table (or enum, with `kind`) already has that name. */
  uniqueName(base = "table", kind: "table" | "enum" = "table"): string {
    return tables.freeName(kind === "table" ? this.tables() : this.enums(), base);
  }

  incomingRefs(tableId: string): IncomingRef[] {
    const target = this.table(tableId);
    return target ? incomingRefs(target, this.tables()) : [];
  }

  columnTargets(): ColumnTarget[] {
    return columnTargets(this.tables());
  }

  enumUsages(enumId: string): EnumUsage[] {
    const target = this.enum(enumId);
    return target ? enumUsages(target, this.tables()) : [];
  }

  /** The table or enum and every card linked to it, directly or through others. */
  connectedTo(id: string): string[] {
    return connectedGroup(schemaGraph([...this.tables(), ...this.enums()]), id);
  }

  // ── Layout ──────────────────────────────────────────────────────────

  /**
   * Lays out the tables and enums (only `ids`, when given) so links read left to right with few
   * crossings, keeping their top-left corner. One undo step.
   */
  tidy = (ids?: readonly string[]): void => tidySchema(this.doc, ids);

  // ── DBML ────────────────────────────────────────────────────────────

  schemaDbml(): string {
    return serializeSchema(schemaShapes(this.doc));
  }

  tableDbml(id: string): string {
    const table = this.table(id);
    return table ? serializeTable(table, new Map(this.tables().map((t) => [t.id, t]))) : "";
  }

  enumDbml(id: string): string {
    const target = this.enum(id);
    return target ? serializeEnum(target) : "";
  }

  applySchemaDbml = (text: string, options?: DbApplyOptions): DbApplyResult =>
    applySchemaText(this.doc, text, options);
  importSchemaDbml = (text: string): DbApplyResult => importSchemaText(this.doc, text);
  applyTableDbml = (id: string, text: string, options?: DbApplyOptions): DbApplyResult =>
    applyTableText(this.doc, id, text, options);
  applyEnumDbml = (id: string, text: string): DbApplyResult => applyEnumText(this.doc, id, text);

  // ── Visual edits ──────────────────────────────────────────────────────

  updateTable = (id: string, patch: DbTablePatch) => tables.updateTable(this.doc, id, patch);
  addColumn = (tableId: string) => tables.addColumn(this.doc, tableId);
  updateColumn = (tableId: string, columnId: string, patch: DbColumnPatch) =>
    tables.updateColumn(this.doc, tableId, columnId, patch);
  moveColumn = (tableId: string, columnId: string, toIndex: number) =>
    tables.moveColumn(this.doc, tableId, columnId, toIndex);
  removeColumn = (tableId: string, columnId: string) =>
    tables.removeColumn(this.doc, tableId, columnId);
  setColumnRef = (tableId: string, columnId: string, ref: DbRef | null) =>
    tables.setColumnRef(this.doc, tableId, columnId, ref);
  addIndex = (tableId: string, columnId?: string) => tables.addIndex(this.doc, tableId, columnId);
  updateIndex = (tableId: string, indexId: string, patch: DbIndexPatch) =>
    tables.updateIndex(this.doc, tableId, indexId, patch);
  removeIndex = (tableId: string, indexId: string) =>
    tables.removeIndex(this.doc, tableId, indexId);
  setNoteHidden = (tableId: string, hidden: boolean) =>
    tables.setNoteHidden(this.doc, tableId, hidden);

  updateEnum = (id: string, patch: DbEnumPatch) => enums.updateEnum(this.doc, id, patch);
  addEnumValue = (id: string) => enums.addEnumValue(this.doc, id);
  updateEnumValue = (id: string, valueId: string, patch: DbEnumValuePatch) =>
    enums.updateEnumValue(this.doc, id, valueId, patch);
  removeEnumValue = (id: string, valueId: string) => enums.removeEnumValue(this.doc, id, valueId);
  moveEnumValue = (id: string, valueId: string, toIndex: number) =>
    enums.moveEnumValue(this.doc, id, valueId, toIndex);
}
