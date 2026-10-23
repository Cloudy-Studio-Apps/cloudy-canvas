import type { Point } from "@canvas";

import { pointInPolygon } from "../node/shape-points";
import { flatten } from "@canvas";
import { reverseCurve, segmentCurve } from "./network-curves";
import type { HalfEdge, NetworkFace, VectorNetwork } from "./network.types";

/** Faces smaller than this (world units squared) are slivers, not areas. */
const MIN_AREA = 1e-3;

const key = ({ segment, forward }: HalfEdge) => segment * 2 + (forward ? 0 : 1);

/**
 * The areas the network's segments enclose (what the paint bucket fills), found by walking its
 * half-edges: at each vertex the edges leaving it are ordered by the angle they leave at, and a
 * walk arriving along u→w continues with the edge right after w→u. Each closed walk is a face;
 * with this rule (screen coordinates, y down) the enclosed ones have a positive signed area and
 * the outer ones a negative one, which are dropped.
 */
export function networkFaces(net: VectorNetwork): NetworkFace[] {
  const curveOf = (edge: HalfEdge) => {
    const curve = segmentCurve(net, edge.segment);
    return edge.forward ? curve : reverseCurve(curve);
  };
  /** The direction an edge leaves its first vertex at (its handle, or toward its other end). */
  const angleOf = (edge: HalfEdge) => {
    const [p0, p1, p2, p3] = curveOf(edge);
    const toward = p1.x !== p0.x || p1.y !== p0.y ? p1 : p2.x !== p0.x || p2.y !== p0.y ? p2 : p3;
    return Math.atan2(toward.y - p0.y, toward.x - p0.x);
  };

  const outgoing = new Map<number, HalfEdge[]>();
  net.segments.forEach((segment, index) => {
    if (segment.start === segment.end) return;
    for (const [vertex, forward] of [
      [segment.start, true],
      [segment.end, false],
    ] as const) {
      const list = outgoing.get(vertex) ?? [];
      list.push({ segment: index, forward });
      outgoing.set(vertex, list);
    }
  });
  for (const list of outgoing.values()) list.sort((a, b) => angleOf(a) - angleOf(b));

  const target = (edge: HalfEdge) => {
    const segment = net.segments[edge.segment]!;
    return edge.forward ? segment.end : segment.start;
  };
  const next = (edge: HalfEdge): HalfEdge => {
    const list = outgoing.get(target(edge))!;
    const back = list.findIndex((e) => e.segment === edge.segment && e.forward !== edge.forward);
    return list[(back + 1) % list.length]!;
  };

  const faces: NetworkFace[] = [];
  const seen = new Set<number>();
  for (const list of outgoing.values()) {
    for (const first of list) {
      if (seen.has(key(first))) continue;
      const loop: number[] = [];
      const polygon: Point[] = [];
      for (let edge = first; !seen.has(key(edge)); edge = next(edge)) {
        seen.add(key(edge));
        loop.push(edge.segment);
        polygon.push(...flatten(curveOf(edge)).slice(0, -1));
      }
      const area = signedArea(polygon);
      if (area > MIN_AREA) faces.push({ loop, polygon, area });
    }
  }
  return faces;
}

/** The smallest face holding `p` (local coordinates), or `null`. */
export function faceAt(net: VectorNetwork, p: Point): NetworkFace | null {
  let best: NetworkFace | null = null;
  for (const face of networkFaces(net)) {
    if (pointInPolygon(face.polygon, p) && (!best || face.area < best.area)) best = face;
  }
  return best;
}

/** Shoelace area, positive for loops turning clockwise on screen. */
function signedArea(polygon: readonly Point[]): number {
  let sum = 0;
  polygon.forEach((a, i) => {
    const b = polygon[(i + 1) % polygon.length]!;
    sum += a.x * b.y - b.x * a.y;
  });
  return sum / 2;
}
