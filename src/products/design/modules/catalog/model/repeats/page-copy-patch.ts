import { pathRoot } from "@canvas";

import type { DesignNode } from "../../../core";
import { mirroredField } from "../../../data";
import type { PageCopyPlace } from "./page-copy-patch.types";

/** Fields a generated page's layer never takes from its template layer (it has its own, or none). */
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

/**
 * What a layer drops when its template layer no longer has it: what binds it to data or reads it
 * as a page item, so a copy never keeps a binding its template lost.
 */
const DROPPED: Record<string, unknown> = {
  dataText: null,
  dataBindings: null,
  dataVisible: null,
  dataHideEmpty: false,
  repeat: null,
  catalogText: null,
};

function same(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-6;
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/**
 * What a generated page's layer needs to look like its template layer again, `null` when nothing
 * (compared as JSON, so a sync that changes nothing writes nothing). `kept` are the paths the copy
 * keeps (what its data, its layout or its page items write): a field holding one keeps the copy's
 * leaf. Data and page-item fields the template lost are dropped.
 */
export function pageCopyPatch(
  copy: DesignNode,
  source: DesignNode,
  place: PageCopyPlace,
  kept: readonly string[],
): Record<string, unknown> | null {
  const was = copy as unknown as Record<string, unknown>;
  const from = source as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(from)) {
    if (OWN.has(field) || value === undefined) continue;
    const want = mirroredField(field, value, copy, kept);
    if (want && !same(was[field], want.value)) patch[field] = want.value;
  }
  for (const [field, empty] of Object.entries(DROPPED)) {
    if (from[field] != null || was[field] == null || same(was[field], empty)) continue;
    if (kept.some((path) => pathRoot(path) === field)) continue;
    patch[field] = empty;
  }
  const own: Record<string, unknown> = {
    parentId: place.parentId,
    pageId: place.pageId,
    locked: true,
    repeatCopy: place.tag,
  };
  if (place.x !== null && !kept.includes("x")) own.x = place.x;
  if (place.y !== null && !kept.includes("y")) own.y = place.y;
  if (place.index !== null) own.index = place.index;
  for (const [field, value] of Object.entries(own)) {
    if (!same(was[field], value)) patch[field] = value;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}
