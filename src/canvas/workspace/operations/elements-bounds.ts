import { elementBounds } from "../../elements";
import { unionRects } from "../../geometry";
import type { Rect } from "../../geometry.types";
import type { WorkspaceParts } from "./workspace-parts.types";

/** The box round where these elements show, or `null` when none of them is in the scope. */
export function elementsBounds(
  { kinds, scene }: WorkspaceParts,
  ids: Iterable<string>,
): Rect | null {
  const rects: Rect[] = [];
  for (const id of ids) {
    const el = scene.get(id);
    if (el) rects.push(elementBounds(kinds.kindOf(el), el));
  }
  return unionRects(rects);
}
