import type { BoardDocument, ErShape, ShapePatch } from "../document";
import { unionRects } from "../geometry";
import type { Point } from "../geometry.types";
import { shapeBounds } from "../hit-test";
import { allErShapes } from "./er-shapes";
import { layoutAll, placeNew } from "./layout";
import { centersOf, placeAt, topLefts } from "./position-layout";
import type { ErPlan } from "./reconcile-er.types";

/** Space between a new diagram and the rest of the board. */
const BOARD_GAP = 160;

/**
 * Writes an ER plan as one undo step. When the diagram is (almost) all new, such as text pasted
 * over the entity the ER tool placed, the whole diagram is laid out fresh, starting where that
 * entity was or beside the other content. Otherwise only the new shapes are placed, around the rest.
 */
export function applyErPlan(doc: BoardDocument, { shapes, added, removed }: ErPlan): void {
  const all = allErShapes(shapes);
  const kept = all.filter((s) => !added.has(s.id));
  const first = kept[0];
  const positions =
    kept.length > 1
      ? topLefts(all, placeNew(shapes, centersOf(kept), added))
      : placeAt(all, layoutAll(shapes), first ?? freeOrigin(doc, new Set(removed)));

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
  });
}

/** Right of everything on the board (ignoring `ignore`), or the origin on an empty board. */
export function freeOrigin(doc: BoardDocument, ignore: ReadonlySet<string>): Point {
  const bounds = unionRects(
    doc
      .all()
      .filter((shape) => !ignore.has(shape.id))
      .map(shapeBounds),
  );
  return bounds
    ? { x: Math.round(bounds.x + bounds.w + BOARD_GAP), y: Math.round(bounds.y) }
    : { x: 0, y: 0 };
}

/** Everything but the identity and the board order, which existing shapes keep. */
function contentPatch(shape: ErShape): ShapePatch {
  const patch: Partial<Record<keyof ErShape, unknown>> = { ...shape };
  delete patch.id;
  delete patch.type;
  delete patch.index;
  return patch as ShapePatch;
}
