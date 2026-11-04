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

/**
 * What an edit asks the data sync to fill again: `all` when a source changed what its layers
 * read (or one was added or removed), otherwise the changed layers that carry data fields.
 */
export function affectedData(doc: CanvasDocument, change: EditedChange): AffectedData {
  if (change.removed.some((el) => el.type === DATA_SOURCE_TYPE)) return { all: true, nodes: [] };
  const nodes: string[] = [];
  for (const id of change.updated) {
    if (doc.field(id, "type") === DATA_SOURCE_TYPE) {
      if (recordChanged(doc, id, change.before.get(id))) return { all: true, nodes: [] };
      continue;
    }
    const el = doc.get(id);
    if (el && isDesignNode(el) && hasDataFields(el)) nodes.push(id);
  }
  return { all: false, nodes };
}
