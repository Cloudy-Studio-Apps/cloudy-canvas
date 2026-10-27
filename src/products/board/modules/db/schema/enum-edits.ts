import type { CanvasDocument } from "@canvas";
import { createId } from "@shared/core";

import { enumSize, isDbEnum, type DbEnumElement, type DbEnumValue } from "../enum";
import { isDbTable } from "../table";
import { freeName, moveItem } from "./table-edits";
import type { DbEnumPatch, DbEnumValuePatch } from "./db-schema.types";
import { patchEnum, patchTable } from "./patch-db-element";
import { t } from "../db.i18n";

// Visual edits to one enum. Each is one undo step. Functions that validate return an error message.

function getEnum(doc: CanvasDocument, id: string): DbEnumElement | undefined {
  const shape = doc.get(id);
  return isDbEnum(shape) ? shape : undefined;
}

/** Renames also update the type of every column that used the old name. */
export function updateEnum(doc: CanvasDocument, id: string, patch: DbEnumPatch): string | null {
  const current = getEnum(doc, id);
  if (!current) return null;
  const name = patch.name?.trim();
  if (name !== undefined) {
    if (!name) return t("errors.enumNeedsName");
    if (doc.all().some((s) => isDbEnum(s) && s.id !== id && s.name === name))
      return t("errors.nameUsed", { name });
  }
  doc.checkpoint();
  doc.batch(() => {
    const nextName = name ?? current.name;
    patchEnum(doc, id, { ...patch, name: nextName, ...enumSize(nextName, current.values) });
    if (nextName !== current.name) renameEnumType(doc, current.name, nextName);
  });
  return null;
}

/** Points columns typed `from` at the enum's new name `to`. Call inside a batch. */
export function renameEnumType(doc: CanvasDocument, from: string, to: string): void {
  for (const table of doc.all().filter(isDbTable)) {
    if (!table.columns.some((c) => c.type === from)) continue;
    patchTable(doc, table.id, {
      columns: table.columns.map((c) => (c.type === from ? { ...c, type: to } : c)),
    });
  }
}

export function addEnumValue(doc: CanvasDocument, id: string): string | null {
  const current = getEnum(doc, id);
  if (!current) return null;
  const value: DbEnumValue = { id: createId(), name: freeName(current.values, "value"), note: "" };
  writeValues(doc, current, [...current.values, value]);
  return value.id;
}

export function updateEnumValue(
  doc: CanvasDocument,
  id: string,
  valueId: string,
  patch: DbEnumValuePatch,
): string | null {
  const current = getEnum(doc, id);
  if (!current) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) return t("errors.valueNeedsName");
    if (current.values.some((v) => v.id !== valueId && v.name === name))
      return t("errors.nameUsed", { name });
    patch = { ...patch, name };
  }
  writeValues(
    doc,
    current,
    current.values.map((v) => (v.id === valueId ? { ...v, ...patch } : v)),
  );
  return null;
}

export function removeEnumValue(doc: CanvasDocument, id: string, valueId: string): void {
  const current = getEnum(doc, id);
  if (current)
    writeValues(
      doc,
      current,
      current.values.filter((v) => v.id !== valueId),
    );
}

export function moveEnumValue(
  doc: CanvasDocument,
  id: string,
  valueId: string,
  toIndex: number,
): void {
  const current = getEnum(doc, id);
  const from = current?.values.findIndex((v) => v.id === valueId) ?? -1;
  if (!current || from < 0 || from === toIndex) return;
  writeValues(doc, current, moveItem(current.values, from, toIndex));
}

function writeValues(doc: CanvasDocument, current: DbEnumElement, values: DbEnumValue[]): void {
  doc.checkpoint();
  patchEnum(doc, current.id, { values, ...enumSize(current.name, values) });
}
