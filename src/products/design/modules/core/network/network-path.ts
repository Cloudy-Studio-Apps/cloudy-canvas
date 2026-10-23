import {
  curveOf,
  flatness,
  isLine,
  type CubicCurve,
  type PathContour,
  type PathShape,
  type Point,
} from "@canvas";

import { strokeChains } from "./network-chains";
import { loopCurves } from "./network-curves";
import type { VectorNetwork, VectorRegion, VectorSegment } from "./network.types";

/** How far a piece's handles may stray from its chord and still count as straight, in units. */
const STRAIGHT = 1e-6;

/** Curves that follow each other as a contour. */
export function curvesContour(curves: readonly CubicCurve[], closed: boolean): PathContour | null {
  const [first] = curves;
  if (!first) return null;
  return {
    start: first[0],
    segments: curves.map(([, c1, c2, to]) => ({ c1, c2, to })),
    closed,
  };
}

/** A region's loops as closed contours (as stored: not yet normalized). */
export function regionPath(net: VectorNetwork, region: VectorRegion): PathShape {
  return {
    contours: region.loops
      .map((loop) => curvesContour(loopCurves(net, loop), true))
      .filter((contour) => contour !== null),
  };
}

/** What the network's strokes follow: its chains, open or closed. */
export function strokePath(net: VectorNetwork): PathShape {
  return {
    contours: strokeChains(net)
      .map(({ curves, closed }) => curvesContour(curves, closed))
      .filter((contour) => contour !== null),
  };
}

/**
 * A normalized shape as a network: each contour's points joined by its curves, and one region
 * per outer contour with its holes as further loops (filled even-odd, so the holes show).
 */
export function pathToNetwork(shape: PathShape): VectorNetwork {
  const vertices: Point[] = [];
  const segments: VectorSegment[] = [];
  const regions: VectorRegion[] = [];
  for (const contour of shape.contours) {
    const first = vertices.length;
    vertices.push(contour.start);
    const loop: number[] = [];
    let from = contour.start;
    contour.segments.forEach((segment, i) => {
      const last = i === contour.segments.length - 1;
      const start = vertices.length - 1;
      const end = contour.closed && last ? first : vertices.push(segment.to) - 1;
      // Straight pieces (control points on their chord, as booleans rebuild a box's edges) keep
      // no handles.
      const curved = !isLine(from, segment) && flatness(curveOf(from, segment)) > STRAIGHT;
      loop.push(segments.length);
      segments.push({
        start,
        end,
        tangentStart: curved ? sub(segment.c1, from) : { x: 0, y: 0 },
        tangentEnd: curved ? sub(segment.c2, segment.to) : { x: 0, y: 0 },
      });
      from = segment.to;
    });
    if (!contour.closed) continue;
    const region = regions[regions.length - 1];
    if (contour.hole && region) region.loops.push(loop);
    else regions.push({ loops: [loop], windingRule: "evenodd" });
  }
  return { vertices, segments, regions };
}

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}
