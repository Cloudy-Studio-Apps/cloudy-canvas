import type { Point } from "@canvas";

import type { VectorNetwork, VectorSegment } from "./network.types";

/** Tangent length that makes a cubic bezier follow a quarter circle, per unit of radius. */
const KAPPA = 0.5523;
const ZERO: Point = { x: 0, y: 0 };

const straight = (start: number, end: number): VectorSegment => ({
  start,
  end,
  tangentStart: ZERO,
  tangentEnd: ZERO,
});

/** An open chain through a flat [x0, y0, x1, y1, …] list (a pencil line). */
export function polylineNetwork(points: readonly number[]): VectorNetwork {
  const vertices: Point[] = [];
  for (let i = 0; i + 1 < points.length; i += 2)
    vertices.push({ x: points[i]!, y: points[i + 1]! });
  const segments = vertices.slice(1).map((_, i) => straight(i, i + 1));
  return { vertices, segments, regions: [] };
}

/** A closed, filled outline through `points` (a polygon or a star). */
export function polygonNetwork(points: readonly Point[]): VectorNetwork {
  const vertices = points.map((p) => ({ ...p }));
  const segments = vertices.map((_, i) => straight(i, (i + 1) % vertices.length));
  return {
    vertices,
    segments,
    regions: [{ loops: [segments.map((_, i) => i)], windingRule: "nonzero" }],
  };
}

/** A filled `w`×`h` box, with corners rounded by `radius` (as quarter-circle curves). */
export function rectNetwork(w: number, h: number, radius: number): VectorNetwork {
  const r = Math.min(radius, w / 2, h / 2);
  if (r <= 0) {
    return polygonNetwork([
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h },
    ]);
  }
  const k = r * KAPPA;
  // Each corner is a curve between the two points where its sides start bending.
  const vertices: Point[] = [
    { x: r, y: 0 },
    { x: w - r, y: 0 },
    { x: w, y: r },
    { x: w, y: h - r },
    { x: w - r, y: h },
    { x: r, y: h },
    { x: 0, y: h - r },
    { x: 0, y: r },
  ];
  const segments: VectorSegment[] = [
    straight(0, 1),
    { start: 1, end: 2, tangentStart: { x: k, y: 0 }, tangentEnd: { x: 0, y: -k } },
    straight(2, 3),
    { start: 3, end: 4, tangentStart: { x: 0, y: k }, tangentEnd: { x: k, y: 0 } },
    straight(4, 5),
    { start: 5, end: 6, tangentStart: { x: -k, y: 0 }, tangentEnd: { x: 0, y: k } },
    straight(6, 7),
    { start: 7, end: 0, tangentStart: { x: 0, y: -k }, tangentEnd: { x: -k, y: 0 } },
  ];
  return {
    vertices,
    segments,
    regions: [{ loops: [segments.map((_, i) => i)], windingRule: "nonzero" }],
  };
}

/** A filled ellipse filling a `w`×`h` box: four quarter curves. */
export function ellipseNetwork(w: number, h: number): VectorNetwork {
  const rx = w / 2;
  const ry = h / 2;
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  const vertices: Point[] = [
    { x: rx, y: 0 },
    { x: w, y: ry },
    { x: rx, y: h },
    { x: 0, y: ry },
  ];
  const segments: VectorSegment[] = [
    { start: 0, end: 1, tangentStart: { x: kx, y: 0 }, tangentEnd: { x: 0, y: -ky } },
    { start: 1, end: 2, tangentStart: { x: 0, y: ky }, tangentEnd: { x: kx, y: 0 } },
    { start: 2, end: 3, tangentStart: { x: -kx, y: 0 }, tangentEnd: { x: 0, y: ky } },
    { start: 3, end: 0, tangentStart: { x: 0, y: -ky }, tangentEnd: { x: -kx, y: 0 } },
  ];
  return { vertices, segments, regions: [{ loops: [[0, 1, 2, 3]], windingRule: "nonzero" }] };
}
