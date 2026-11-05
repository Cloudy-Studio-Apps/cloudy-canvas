import { createId } from "@shared/core";

import type { DesignNode } from "../../core";
import { mirroredField } from "./mirror-field";
import type { DataCopyTag } from "./repeat.types";
import type { CopyPlace } from "./plan-data-copies.types";

/** Fields a copy's layer never takes from its template layer (it has its own, or none). */
const OWN = new Set([
  "id",
  "type",
  "index",
  "parentId",
  "pageId",
  "locked",
  "x",
  "y",
  "dataCopy",
  "catalogCopy",
  "repeatCopy",
]);

function same(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-6;
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/**
 * A fresh copy of a template layer: a new id, under `parentId`, locked and tagged; a catalog
 * master's tag and a brochure page copy's (`repeatCopy`, on a card inside a generated page) aren't
 * copied. Its data fields come along, so `planBindings` then fills it from its row.
 */
export function copyNode(
  source: DesignNode,
  parentId: string,
  pageId: string,
  tag: DataCopyTag,
): DesignNode {
  const copy = { ...source, id: createId(), parentId, pageId, locked: true, dataCopy: tag };
  delete (copy as { catalogCopy?: unknown }).catalogCopy;
  delete (copy as { repeatCopy?: unknown }).repeatCopy;
  return copy as DesignNode;
}

/**
 * What a copy's layer needs to look like its template layer again, `null` when nothing (compared
 * as JSON, so a sync that changes nothing writes nothing). `kept` are the paths the copy keeps
 * (its data's and its layout's): a field holding one is written with the copy's leaf kept, so the
 * patch never looks like a hand edit of a bound field. A field the template lacks stays.
 */
export function copyPatch(
  copy: DesignNode,
  source: DesignNode,
  place: CopyPlace,
  kept: readonly string[],
): Partial<DesignNode> | null {
  const was = copy as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(source)) {
    if (OWN.has(field) || value === undefined) continue;
    const want = mirroredField(field, value, copy, kept);
    if (want && !same(was[field], want.value)) patch[field] = want.value;
  }
  const own: Record<string, unknown> = {
    parentId: place.parentId,
    pageId: place.pageId,
    locked: true,
    dataCopy: place.tag,
  };
  if (place.x !== null && !kept.includes("x")) own.x = place.x;
  if (place.y !== null && !kept.includes("y")) own.y = place.y;
  if (place.index !== null) own.index = place.index;
  for (const [field, value] of Object.entries(own)) {
    if (!same(was[field], value)) patch[field] = value;
  }
  return Object.keys(patch).length > 0 ? (patch as Partial<DesignNode>) : null;
}
