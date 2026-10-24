import {
  alignOffset,
  arrangeItems,
  distributeOffsets,
  tidyUpOffsets,
  type Alignment,
  type ArrangeHost,
  type ArrangeItem,
  type DistributeAxis,
} from "../../arrange";
import { unionRects } from "../../geometry";
import type { Point, Rect } from "../../geometry.types";
import { withMembers } from "./members";
import { moveElementsBy } from "./move-elements";
import type { WorkspaceParts } from "./workspace-parts.types";

/** What the arrange helpers read: elements from the scene, with what moves with them. */
export function arrangeHost(parts: WorkspaceParts): ArrangeHost {
  return {
    get: (id) => parts.scene.get(id),
    kinds: parts.kinds,
    withMembers: (members) => withMembers(parts, members, "move"),
  };
}

/**
 * Lines elements up on an edge or center, with what moves with them, as one undo step: with
 * each other, or one element with what holds it (`CanvasProduct.alignTarget`). Nothing changes
 * parent. Returns the moved ids.
 */
export function alignElements(
  parts: WorkspaceParts,
  ids: Iterable<string>,
  alignment: Alignment,
): string[] {
  const items = arrangeItems(ids, arrangeHost(parts));
  const target = alignTargetOf(parts, items);
  if (!target) return [];
  return arrange(
    parts,
    new Map(items.map((item) => [item.id, alignOffset(item.rect, target, alignment)])),
  );
}

/** Whether these elements can be aligned: several of them, or one inside something. */
export function canAlign(parts: WorkspaceParts, ids: Iterable<string>): boolean {
  return alignTargetOf(parts, arrangeItems(ids, arrangeHost(parts))) !== null;
}

/**
 * Spaces elements out evenly on `axis`, the first and last staying put, with what moves with
 * them, as one undo step. Returns the moved ids.
 */
export function distributeElements(
  parts: WorkspaceParts,
  ids: Iterable<string>,
  axis: DistributeAxis,
): string[] {
  return arrange(parts, distributeOffsets(arrangeItems(ids, arrangeHost(parts)), axis));
}

/** Tidies elements into rows and columns, with what moves with them. Returns the moved ids. */
export function tidyUpElements(parts: WorkspaceParts, ids: Iterable<string>): string[] {
  return arrange(parts, tidyUpOffsets(arrangeItems(ids, arrangeHost(parts))));
}

/** What items line up with: their bounds when there are several, or what holds the one. */
function alignTargetOf(
  { product, scene }: WorkspaceParts,
  items: readonly ArrangeItem[],
): Rect | null {
  if (items.length > 1) return unionRects(items.map((item) => item.rect));
  const [only] = items;
  const el = only && scene.get(only.id);
  return (el && product.alignTarget?.(el, scene.elements)) ?? null;
}

/** Moves by these offsets as a new undo step (none when nothing moves). */
function arrange(parts: WorkspaceParts, offsets: ReadonlyMap<string, Point>): string[] {
  if (![...offsets.values()].some(({ x, y }) => x !== 0 || y !== 0)) return [];
  parts.doc.checkpoint();
  return moveElementsBy(parts, offsets);
}
