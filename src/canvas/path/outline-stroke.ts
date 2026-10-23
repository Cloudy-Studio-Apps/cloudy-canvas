import { ClipperOffset, EndType, JoinType, PolyTree64 } from "clipper2-ts";

import { flattenContour } from "./flatten-path";
import type { PathShape, StrokeOutlineOptions } from "./path.types";
import { FLATTEN_TOLERANCE, PATH_SCALE } from "./path-precision";
import { treeToShape } from "./tree-to-shape";

/** Figma's default miter limit. */
const MITER_LIMIT = 4;

const JOINS = { miter: JoinType.Miter, round: JoinType.Round, bevel: JoinType.Bevel } as const;
const CAPS = { butt: EndType.Butt, round: EndType.Round, square: EndType.Square } as const;

/**
 * The area a centered stroke of `width` covers, as a normalized shape (Figma's Outline stroke):
 * closed contours as rings, open ones with their caps. Its edges are straight pieces as fine as
 * `tolerance`.
 */
export function outlineStroke(
  shape: PathShape,
  { width, cap = "butt", join = "miter", miterLimit = MITER_LIMIT }: StrokeOutlineOptions,
  tolerance = FLATTEN_TOLERANCE,
): PathShape {
  if (width <= 0) return { contours: [] };
  const offset = new ClipperOffset(miterLimit, tolerance * PATH_SCALE);
  for (const contour of shape.contours) {
    const path = flattenContour(contour, null, tolerance);
    if (path.length < 2) continue;
    offset.addPath(path, JOINS[join], contour.closed ? EndType.Joined : CAPS[cap]);
  }
  const tree = new PolyTree64();
  offset.execute((width / 2) * PATH_SCALE, tree);
  return treeToShape(tree, null);
}
