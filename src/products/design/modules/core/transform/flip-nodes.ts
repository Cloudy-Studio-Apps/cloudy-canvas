import {
  elementBounds,
  unionRects,
  type CanvasElement,
  type CanvasWorkspace,
  type ElementPatch,
} from "@canvas";

import { DesignNodeKind, type FlipAxis } from "../node";

/**
 * Mirrors layers (with what they hold) across the middle of them all, left to right (`x`) or top
 * to bottom (`y`), as one undo step: each kind flips its own (`DesignNodeKind.flip`). Locked
 * layers stay. Returns the flipped ids.
 */
export function flipNodes(
  engine: CanvasWorkspace,
  ids: Iterable<string>,
  axis: FlipAxis,
): string[] {
  const selected = new Set(ids);
  const carried = new Set<string>();
  for (const id of selected)
    for (const member of engine.withMembers([id], "move")) if (member !== id) carried.add(member);
  const roots = [...selected]
    .filter((id) => !carried.has(id))
    .map((id) => engine.getElement(id))
    .filter((el): el is CanvasElement => el !== undefined && !el.locked);
  const box = unionRects(roots.map((el) => elementBounds(engine.kinds.kindOf(el), el)));
  if (!box) return [];
  const at = axis === "x" ? box.x + box.w / 2 : box.y + box.h / 2;

  const patches = new Map<string, ElementPatch>();
  for (const id of engine.withMembers(
    roots.map((el) => el.id),
    "move",
  )) {
    const el = engine.getElement(id);
    const kind = el && engine.kinds.kindOf(el);
    if (el && !el.locked && kind instanceof DesignNodeKind)
      patches.set(id, kind.flip(el, axis, at));
  }
  if (patches.size === 0) return [];
  engine.doc.checkpoint();
  engine.doc.updateMany(patches);
  return [...patches.keys()];
}
