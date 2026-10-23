import type { CanvasDocument, EditedChange, ElementKinds } from "@canvas";

import { DesignNodeKind } from "../core";

/** The fields whose change can move or resize something in an auto layout. */
const LAYOUT_FIELDS = new Set([
  "x",
  "y",
  "w",
  "h",
  "rotation",
  "visible",
  "parentId",
  "index",
  "layout",
  "sizing",
  "layoutAbsolute",
  "sizeLimits",
  "strokeWeight",
  "strokeWeights",
  "strokeAlign",
  "strokes",
  "autoResize",
]);

/**
 * The auto layout frames an edit may change: edited layout frames, and the layout frames above
 * what changed while the change can reach them (through layout frames, which may hug, and
 * through groups, which take their children's bounds; a frame without a layout keeps its size,
 * so it stops there). Each with its depth in the tree, deepest laid out first.
 */
export function dirtyFrames(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
): Map<string, number> {
  const dirty = new Map<string, number>();
  const climb = (start: unknown) => {
    for (let id = start; typeof id === "string"; id = doc.field(id, "parentId")) {
      if (doc.field(id, "layout")) dirty.set(id, 0);
      else if (!hostsChildren(doc, id, kinds)) return;
    }
  };
  for (const id of change.updated) {
    const before = change.before.get(id);
    if (before && !Object.keys(before).some((key) => LAYOUT_FIELDS.has(key))) continue;
    if (doc.field(id, "layout")) dirty.set(id, 0);
    climb(doc.field(id, "parentId"));
    if (before && "parentId" in before) climb(before.parentId);
  }
  for (const el of change.removed) climb((el as { parentId?: unknown }).parentId);
  for (const id of dirty.keys()) dirty.set(id, depthOf(doc, id));
  return dirty;
}

/** Whether the node is made of its children (a group, a boolean), so it changes with them. */
function hostsChildren(doc: CanvasDocument, id: string, kinds: ElementKinds): boolean {
  const type = doc.field(id, "type");
  const kind = typeof type === "string" ? kinds.get(type) : undefined;
  return kind instanceof DesignNodeKind && kind.childHost;
}

function depthOf(doc: CanvasDocument, id: string): number {
  let depth = 0;
  for (let at = doc.field(id, "parentId"); typeof at === "string" && depth < 1000; depth++) {
    at = doc.field(at, "parentId");
  }
  return depth;
}
