import type { Point } from "@canvas";

import type { CubicCurve, VectorNetwork, VectorSegment } from "./network.types";

const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });

/** A segment as a curve from its start to its end. */
export function segmentCurve(net: VectorNetwork, index: number): CubicCurve {
  const segment = net.segments[index]!;
  const p0 = net.vertices[segment.start]!;
  const p3 = net.vertices[segment.end]!;
  return [p0, add(p0, segment.tangentStart), add(p3, segment.tangentEnd), p3];
}

/** The same curve walked the other way. */
export function reverseCurve([p0, p1, p2, p3]: CubicCurve): CubicCurve {
  return [p3, p2, p1, p0];
}

/** The segments meeting at a vertex. */
export function segmentsAt(net: VectorNetwork, vertex: number): number[] {
  return net.segments.flatMap((segment, i) =>
    segment.start === vertex || segment.end === vertex ? [i] : [],
  );
}

/** A segment's tangent at one of its vertices. */
export function tangentAt(segment: VectorSegment, vertex: number): Point {
  return segment.start === vertex ? segment.tangentStart : segment.tangentEnd;
}

/** The vertex at the other end of a segment. */
export function otherEnd(segment: VectorSegment, vertex: number): number {
  return segment.start === vertex ? segment.end : segment.start;
}

/**
 * A loop's curves in order, each turned to start where the previous one ended (loops store
 * segment indices without a direction).
 */
export function loopCurves(net: VectorNetwork, loop: readonly number[]): CubicCurve[] {
  const curves: CubicCurve[] = [];
  const first = net.segments[loop[0]!];
  const second = loop.length > 1 ? net.segments[loop[1]!] : undefined;
  if (!first) return curves;
  // Walk the first segment toward the vertex it shares with the second.
  let at =
    second && (first.start === second.start || first.start === second.end)
      ? first.end
      : first.start;
  for (const index of loop) {
    const segment = net.segments[index];
    if (!segment) continue;
    const curve = segmentCurve(net, index);
    if (segment.start === at) {
      curves.push(curve);
      at = segment.end;
    } else {
      curves.push(reverseCurve(curve));
      at = segment.start;
    }
  }
  return curves;
}
