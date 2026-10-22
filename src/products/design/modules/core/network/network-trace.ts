import type { Graphics } from "pixi.js";

import { loopCurves, otherEnd, segmentCurve, segmentsAt, reverseCurve } from "./network-curves";
import type { CubicCurve, VectorNetwork } from "./network.types";

/** Adds curves that follow each other to the path (the first one starts it). */
function traceCurves(g: Graphics, curves: readonly CubicCurve[], close: boolean): void {
  const [first] = curves;
  if (!first) return;
  g.moveTo(first[0].x, first[0].y);
  for (const [, c1, c2, end] of curves) g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y);
  if (close) g.closePath();
}

/**
 * Traces every segment for stroking, as chains through the vertices joining exactly two of them,
 * so strokes turn there instead of ending (closed chains are closed).
 */
export function traceStrokes(g: Graphics, net: VectorNetwork): void {
  const used = new Set<number>();
  const degree = (vertex: number) => segmentsAt(net, vertex).length;

  const walk = (from: number, firstSegment: number): void => {
    const curves: CubicCurve[] = [];
    let at = from;
    let segment: number | undefined = firstSegment;
    while (segment !== undefined && !used.has(segment)) {
      used.add(segment);
      const seg = net.segments[segment]!;
      const curve = segmentCurve(net, segment);
      curves.push(seg.start === at ? curve : reverseCurve(curve));
      at = otherEnd(seg, at);
      segment = degree(at) === 2 ? segmentsAt(net, at).find((next) => !used.has(next)) : undefined;
    }
    traceCurves(g, curves, at === from && curves.length > 1);
  };

  // Open chains start at ends and branch points; what's left are closed loops.
  net.vertices.forEach((_, vertex) => {
    if (degree(vertex) === 2) return;
    for (const segment of segmentsAt(net, vertex)) if (!used.has(segment)) walk(vertex, segment);
  });
  net.segments.forEach((seg, segment) => {
    if (!used.has(segment)) walk(seg.start, segment);
  });
}

/** Traces the filled regions' loops (each closed). */
export function traceRegions(g: Graphics, net: VectorNetwork): void {
  for (const region of net.regions) {
    for (const loop of region.loops) traceCurves(g, loopCurves(net, loop), true);
  }
}
