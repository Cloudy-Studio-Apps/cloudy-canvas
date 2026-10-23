import { rectOf, unionRects, type CanvasDocument, type ElementPatch, type Point } from "@canvas";

import type { ErDiagramFields, ErElement } from "../base/er.types";
import { allErShapes, placedErShapes } from "./er-shapes";
import { layoutAll, placeNew, type Centers } from "./layout";
import { centersOf, placeAt, topLefts } from "./position-layout";
import type { ErPlan } from "./reconcile-er.types";

/** Space between a new diagram and the rest of the board. */
const BOARD_GAP = 160;

/**
 * Writes an ER plan as one undo step, stamping `scope` (the diagram) on every shape. When the diagram is (almost) all new, such as text pasted
 * over the entity the ER tool placed, the whole diagram is laid out fresh, starting where that
 * entity was or beside the other content. Otherwise only the new shapes are placed, around the rest.
 * New shapes in `pinned` are centered where it says (dropped there) and the rest go round them.
 */
export function applyErPlan(
  doc: CanvasDocument,
  { shapes, added, removed }: ErPlan,
  scope: ErDiagramFields,
  pinned: Centers = new Map(),
  /** Runs after the writes, in the same batch and undo step (e.g. splitting the diagram). */
  after?: () => void,
): void {
  const all = allErShapes(shapes).map((shape) => ({ ...shape, ...scope }));
  // Aggregations and constraints aren't placed: their geometry follows the shapes they connect.
  const placed = placedErShapes(shapes);
  const kept = placed.filter((s) => !added.has(s.id));
  const first = kept[0];
  const free = new Set([...added].filter((id) => !pinned.has(id)));
  const positions =
    kept.length > 1 || pinned.size > 0
      ? topLefts(placed, placeNew(shapes, new Map([...centersOf(kept), ...pinned]), free))
      : placeAt(placed, layoutAll(shapes), first ?? freeOrigin(doc, new Set(removed)));

  doc.checkpoint();
  doc.batch(() => {
    if (removed.length) doc.remove(removed);
    for (const shape of all) {
      if (added.has(shape.id)) {
        doc.add({ ...shape, ...positions.get(shape.id), index: doc.nextIndex() });
      } else {
        doc.update(shape.id, contentPatch(shape));
      }
    }
    after?.();
  });
}

/** Right of everything on the board (ignoring `ignore`), or the origin on an empty board. */
export function freeOrigin(doc: CanvasDocument, ignore: ReadonlySet<string>): Point {
  const bounds = unionRects(
    doc
      .all()
      .filter((shape) => !ignore.has(shape.id))
      .map(rectOf),
  );
  return bounds
    ? { x: Math.round(bounds.x + bounds.w + BOARD_GAP), y: Math.round(bounds.y) }
    : { x: 0, y: 0 };
}

/** Everything but the identity and the board order, which existing shapes keep. */
function contentPatch(shape: ErElement): ElementPatch {
  const patch: Partial<Record<keyof ErElement, unknown>> = { ...shape };
  delete patch.id;
  delete patch.type;
  delete patch.index;
  return patch as ElementPatch;
}
