import type { CanvasDocument, EditedChange } from "@canvas";

import { isDesignNode } from "../../core";
import { hasDataFields } from "../bindings";
import { DATA_SOURCE_TYPE, type DataSnapshot } from "../source";
import type { AffectedData } from "./affected-data.types";

/** A record's fields that change what its layers read. */
const READ_FIELDS = ["name", "fields", "images"] as const;

/** Whether two snapshots hold the same data (an Update that found nothing new only moves `updatedAt`). */
function sameData(a: unknown, b: unknown): boolean {
  if (!a || !b) return !a && !b;
  const x = a as DataSnapshot;
  const y = b as DataSnapshot;
  return x.assetId === y.assetId && x.hash === y.hash;
}

/**
 * Whether a source record's change reaches its layers, read from the edit's `before` (its
 * changed fields' earlier values) against the record now: a new record, or a changed name,
 * fields, images or data. An Update that found the same data (only `snapshot.updatedAt` moved,
 * the same fields written again) and a settings change (it takes an Update to matter) don't.
 */
function recordChanged(
  doc: CanvasDocument,
  id: string,
  before: Readonly<Record<string, unknown>> | undefined,
): boolean {
  if (!before) return true;
  const moved = (field: string) =>
    field in before && JSON.stringify(before[field]) !== JSON.stringify(doc.field(id, field));
  if (READ_FIELDS.some(moved)) return true;
  return "snapshot" in before && !sameData(before.snapshot, doc.field(id, "snapshot"));
}

const ALL: AffectedData = { all: true, nodes: [], iterators: [] };

/**
 * What an edit asks the data sync to fill again: `all` when a source changed what its layers
 * read (or one was added or removed), otherwise the changed layers that carry data fields and
 * the iterators to bring in step: a frame whose `repeat` changed (or that came with one), and
 * every iterator around a layer that changed, came, went or moved (its template's or a copy's).
 * Only frames hold a `repeat`; the sync reads it with `repeatOf`.
 */
export function affectedData(doc: CanvasDocument, change: EditedChange): AffectedData {
  if (change.removed.some((el) => el.type === DATA_SOURCE_TYPE)) return ALL;
  const nodes: string[] = [];
  const iterators = new Set<string>();
  const walked = new Set<string>();
  // Each ancestor holding a repeat; an ancestor walked once had all of its own walked.
  const around = (parentId: unknown) => {
    for (let id = parentId; typeof id === "string" && !walked.has(id);) {
      walked.add(id);
      if (doc.field(id, "repeat") != null) iterators.add(id);
      id = doc.field(id, "parentId");
    }
  };
  for (const id of change.updated) {
    const before = change.before.get(id);
    if (doc.field(id, "type") === DATA_SOURCE_TYPE) {
      if (recordChanged(doc, id, before)) return ALL;
      continue;
    }
    const el = doc.get(id);
    if (!el || !isDesignNode(el)) continue;
    if (hasDataFields(el)) nodes.push(id);
    if (before ? "repeat" in before : doc.field(id, "repeat") != null) iterators.add(id);
    around(el.parentId);
    if (before && "parentId" in before) around(before.parentId);
  }
  for (const el of change.removed) if (isDesignNode(el)) around(el.parentId);
  return { all: false, nodes, iterators: [...iterators] };
}
