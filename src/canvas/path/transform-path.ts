import type { Point } from "../geometry.types";
import { rotatePoint } from "../rotation";
import type { PathPlacement, PathShape } from "./path.types";

/** A shape with every point mapped by `f` (an affine map keeps curves exact). */
export function mapPath(shape: PathShape, f: (p: Point) => Point): PathShape {
  return {
    contours: shape.contours.map((contour) => ({
      ...contour,
      start: f(contour.start),
      segments: contour.segments.map(({ c1, c2, to }) => ({ c1: f(c1), c2: f(c2), to: f(to) })),
    })),
  };
}

/**
 * A shape in local coordinates placed in the world: mirrored in its box when the placement is,
 * moved to (x, y) and turned round it.
 */
export function placePath(shape: PathShape, placement: PathPlacement): PathShape {
  const { x, y, rotation = 0 } = placement;
  const origin = { x, y };
  const flip = mirrorX(placement);
  return mapPath(shape, (p) => rotatePoint({ x: x + flip(p.x), y: y + p.y }, origin, rotation));
}

/** A world shape in a placement's local coordinates (the inverse of `placePath`). */
export function localPath(shape: PathShape, placement: PathPlacement): PathShape {
  const { x, y, rotation = 0 } = placement;
  const origin = { x, y };
  const flip = mirrorX(placement);
  return mapPath(shape, (p) => {
    const q = rotatePoint(p, origin, -rotation);
    return { x: flip(q.x - x), y: q.y - y };
  });
}

/** A shape mirrored left to right inside a box `w` wide. */
export function mirrorPath(shape: PathShape, w: number): PathShape {
  return mapPath(shape, (p) => ({ x: w - p.x, y: p.y }));
}

function mirrorX({ mirrored, w = 0 }: PathPlacement): (x: number) => number {
  return mirrored ? (x) => w - x : (x) => x;
}
