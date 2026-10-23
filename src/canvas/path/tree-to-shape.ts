import type { PolyPath64 } from "clipper2-ts";

import type { PathContour, PathShape } from "./path.types";
import { rebuildContour } from "./rebuild-contour";
import type { SourceTags } from "./source-tags";

/**
 * A Clipper result tree as a normalized shape: each outer contour followed by its holes, then
 * the islands inside those holes, and so on.
 */
export function treeToShape(tree: PolyPath64, tags: SourceTags | null): PathShape {
  const contours: PathContour[] = [];
  const addOuters = (parent: PolyPath64) => {
    for (let i = 0; i < parent.count; i++) {
      const outer = parent.child(i);
      if (!outer.polygon || outer.polygon.length < 3) continue;
      contours.push(rebuildContour(outer.polygon, tags, false));
      const holes = Array.from({ length: outer.count }, (_, j) => outer.child(j));
      for (const hole of holes) {
        if (hole.polygon && hole.polygon.length >= 3) {
          contours.push(rebuildContour(hole.polygon, tags, true));
        }
      }
      for (const hole of holes) addOuters(hole);
    }
  };
  addOuters(tree);
  return { contours };
}
