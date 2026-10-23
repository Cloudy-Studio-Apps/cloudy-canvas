import type { Path64, Paths64 } from "clipper2-ts";

import type { Point } from "../geometry.types";
import { flatness, splitAt } from "./bezier";
import type { CubicCurve, CurveTag, PathContour, PathShape } from "./path.types";
import { FLATTEN_TOLERANCE, MAX_FLATTEN_DEPTH, PATH_SCALE } from "./path-precision";
import { curveOf } from "./path-segments";
import type { SourceTags } from "./source-tags";

/**
 * A contour as Clipper's integer points, curves split until they stray less than `tolerance`
 * from their chords. With `tags`, each point records the curves it lies on (its `z`), so the
 * result's curves can be rebuilt. A closed contour doesn't repeat its start.
 */
export function flattenContour(
  contour: PathContour,
  tags: SourceTags | null,
  tolerance = FLATTEN_TOLERANCE,
): Path64 {
  const path: Path64 = [];
  let from = contour.start;
  const curves = contour.segments.map((segment) => {
    const curve = curveOf(from, segment);
    from = segment.to;
    return curve;
  });
  const last = curves[curves.length - 1];
  const push = (p: Point, at: CurveTag[]) => {
    const x = Math.round(p.x * PATH_SCALE);
    const y = Math.round(p.y * PATH_SCALE);
    const previous = path[path.length - 1];
    if (previous?.x === x && previous.y === y) return;
    path.push(tags ? { x, y, z: tags.add(at) } : { x, y });
  };

  const [first] = curves;
  if (!first) return path;
  push(contour.start, [
    { curve: first, t: 0 },
    ...(contour.closed && last ? [{ curve: last, t: 1 }] : []),
  ]);
  curves.forEach((curve, i) => {
    const next = curves[i + 1];
    for (const { t, point } of samples(curve, tolerance)) {
      if (t === 1 && contour.closed && !next) continue; // Back at the start.
      push(
        point,
        t === 1 && next
          ? [
              { curve, t },
              { curve: next, t: 0 },
            ]
          : [{ curve, t }],
      );
    }
  });
  return path;
}

/** Every contour of a shape, all taken as closed (a fill closes open contours). */
export function flattenShape(
  shape: PathShape,
  tags: SourceTags | null,
  tolerance = FLATTEN_TOLERANCE,
): Paths64 {
  return shape.contours
    .map((contour) => flattenContour({ ...contour, closed: true }, tags, tolerance))
    .filter((path) => path.length >= 3);
}

/** Points along a curve after its start, up to and including its end (`t` = 1). */
function samples(curve: CubicCurve, tolerance: number): { t: number; point: Point }[] {
  const out: { t: number; point: Point }[] = [];
  const split = (piece: CubicCurve, t0: number, t1: number, depth: number) => {
    if (depth >= MAX_FLATTEN_DEPTH || flatness(piece) <= tolerance) {
      out.push({ t: t1, point: piece[3] });
      return;
    }
    const [a, b] = splitAt(piece, 0.5);
    const middle = (t0 + t1) / 2;
    split(a, t0, middle, depth + 1);
    split(b, middle, t1, depth + 1);
  };
  split(curve, 0, 1, 0);
  return out;
}
