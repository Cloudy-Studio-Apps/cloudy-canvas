import { boundsOfPoints, type Point, type Rect } from "@canvas";

import { pointInPolygon } from "../node/shape-points";
import { flatten, nearestT } from "./bezier";
import { loopCurves, segmentCurve } from "./network-curves";
import type { SegmentHit, VectorNetwork } from "./network.types";

/** The box around everything the network draws (its curves, not just its vertices). */
export function networkBounds(net: VectorNetwork): Rect {
  const points: number[] = [];
  for (const vertex of net.vertices) points.push(vertex.x, vertex.y);
  net.segments.forEach((_, i) => {
    for (const p of flatten(segmentCurve(net, i))) points.push(p.x, p.y);
  });
  return points.length > 0 ? boundsOfPoints(points) : { x: 0, y: 0, w: 0, h: 0 };
}

/** The segment nearest to `p` (local), when it's within `tolerance`. */
export function hitSegment(net: VectorNetwork, p: Point, tolerance: number): SegmentHit | null {
  let best: SegmentHit | null = null;
  net.segments.forEach((_, segment) => {
    const { t, distance } = nearestT(segmentCurve(net, segment), p);
    if (distance <= tolerance && (!best || distance < best.distance))
      best = { segment, t, distance };
  });
  return best;
}

/** The vertex nearest to `p` (local) within `tolerance`, or `null`. */
export function vertexAt(net: VectorNetwork, p: Point, tolerance: number): number | null {
  let best: number | null = null;
  let bestDistance = tolerance;
  net.vertices.forEach((vertex, i) => {
    const distance = Math.hypot(vertex.x - p.x, vertex.y - p.y);
    if (distance <= bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });
  return best;
}

/** Whether `p` (local) is inside one of the network's filled regions. */
export function insideRegion(net: VectorNetwork, p: Point): boolean {
  return net.regions.some((region) => {
    let inside = false;
    for (const loop of region.loops) {
      const polygon = loopCurves(net, loop).flatMap((curve) => flatten(curve));
      if (pointInPolygon(polygon, p)) inside = !inside;
    }
    return inside;
  });
}
