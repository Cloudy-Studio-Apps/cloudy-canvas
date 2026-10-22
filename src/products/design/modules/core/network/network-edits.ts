import type { Point } from "@canvas";

import { bendThrough, splitAt } from "./bezier";
import { otherEnd, segmentCurve, segmentsAt, tangentAt } from "./network-curves";
import type { CubicCurve, VectorNetwork, VectorSegment } from "./network.types";

// Pure edits: each returns a new network and leaves the one it's given alone.

const ZERO: Point = { x: 0, y: 0 };
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });

function copy(net: VectorNetwork): VectorNetwork {
  return {
    vertices: net.vertices.map((v) => ({ ...v })),
    segments: net.segments.map((s) => ({ ...s })),
    regions: net.regions.map((r) => ({ ...r, loops: r.loops.map((loop) => [...loop]) })),
  };
}

/** A segment from `start` to `end` drawing `curve` (control points as tangents). */
function segmentFor(start: number, end: number, curve: CubicCurve): VectorSegment {
  return { start, end, tangentStart: sub(curve[1], curve[0]), tangentEnd: sub(curve[2], curve[3]) };
}

/** Moves vertices (their tangents follow, being relative). */
export function moveVertices(
  net: VectorNetwork,
  vertices: ReadonlySet<number>,
  dx: number,
  dy: number,
): VectorNetwork {
  const next = copy(net);
  for (const i of vertices) {
    const v = next.vertices[i];
    if (v) next.vertices[i] = { x: v.x + dx, y: v.y + dy };
  }
  return next;
}

/**
 * Sets a segment's tangent at `vertex`. With `mirror`, a vertex joining exactly two segments
 * keeps a smooth turn: the other segment's tangent there points the opposite way.
 */
export function setTangent(
  net: VectorNetwork,
  segment: number,
  vertex: number,
  tangent: Point,
  mirror: boolean,
): VectorNetwork {
  const next = copy(net);
  const write = (index: number, value: Point) => {
    const seg = next.segments[index]!;
    if (seg.start === vertex) seg.tangentStart = value;
    else seg.tangentEnd = value;
  };
  write(segment, tangent);
  const others = segmentsAt(next, vertex).filter((i) => i !== segment);
  if (mirror && others.length === 1) write(others[0]!, { x: -tangent.x, y: -tangent.y });
  return next;
}

/**
 * Adds a vertex on a segment at `t`, splitting it into two that draw the same curve. Returns the
 * network and the new vertex.
 */
export function splitSegment(
  net: VectorNetwork,
  segment: number,
  t: number,
): { network: VectorNetwork; vertex: number } {
  const next = copy(net);
  const seg = next.segments[segment]!;
  const [left, right] = splitAt(segmentCurve(net, segment), t);
  const vertex = next.vertices.push(left[3]) - 1;
  const added = next.segments.push(segmentFor(vertex, seg.end, right)) - 1;
  next.segments[segment] = segmentFor(seg.start, vertex, left);
  for (const region of next.regions) {
    region.loops = region.loops.map((loop) =>
      loop.flatMap((index) => (index === segment ? [segment, added] : [index])),
    );
  }
  return { network: next, vertex };
}

/** Adds a lone vertex. Returns the network and its index. */
export function addVertex(
  net: VectorNetwork,
  at: Point,
): { network: VectorNetwork; vertex: number } {
  const next = copy(net);
  return { network: next, vertex: next.vertices.push({ ...at }) - 1 };
}

/**
 * Joins two vertices with a straight segment. When they were already connected, the new segment
 * closes a loop, which becomes a filled region. Returns the network and the segment.
 */
export function connect(
  net: VectorNetwork,
  from: number,
  to: number,
): { network: VectorNetwork; segment: number } {
  const path = pathBetween(net, to, from);
  const next = copy(net);
  const segment =
    next.segments.push({ start: from, end: to, tangentStart: ZERO, tangentEnd: ZERO }) - 1;
  if (path) next.regions.push({ loops: [[segment, ...path]], windingRule: "nonzero" });
  return { network: next, segment };
}

/** The segments of the shortest path between two vertices (breadth first), or `null`. */
function pathBetween(net: VectorNetwork, from: number, to: number): number[] | null {
  if (from === to) return null;
  const via = new Map<number, number>([[from, -1]]);
  const queue = [from];
  for (let at = queue.shift(); at !== undefined; at = queue.shift()) {
    for (const segment of segmentsAt(net, at)) {
      const next = otherEnd(net.segments[segment]!, at);
      if (via.has(next)) continue;
      via.set(next, segment);
      if (next === to) {
        const path: number[] = [];
        for (let v = to; v !== from;) {
          const s = via.get(v)!;
          path.unshift(s);
          v = otherEnd(net.segments[s]!, v);
        }
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}

/**
 * Removes vertices and segments (and the segments of removed vertices). A removed vertex that
 * joined exactly two kept segments is healed: its neighbors are joined instead, as in Figma.
 * Regions that lose a segment are dropped.
 */
export function removeParts(
  net: VectorNetwork,
  vertices: ReadonlySet<number>,
  segments: ReadonlySet<number>,
): VectorNetwork {
  let next = copy(net);
  const dropped = new Set(segments);
  for (const vertex of vertices) {
    const around = segmentsAt(next, vertex).filter((i) => !dropped.has(i));
    if (around.length === 2) {
      const [a, b] = around.map((i) => next.segments[i]!) as [VectorSegment, VectorSegment];
      const from = otherEnd(a, vertex);
      const to = otherEnd(b, vertex);
      next.segments[around[0]!] = {
        start: from,
        end: to,
        tangentStart: tangentAt(a, from),
        tangentEnd: tangentAt(b, to),
      };
      for (const region of next.regions) {
        region.loops = region.loops.map((loop) => loop.filter((i) => i !== around[1]));
      }
      dropped.add(around[1]!);
    } else {
      for (const i of around) dropped.add(i);
    }
  }
  next = {
    ...next,
    regions: next.regions.filter((r) => r.loops.every((l) => l.every((i) => !dropped.has(i)))),
  };
  return compact(next, vertices, dropped);
}

/** Drops vertices and segments by index, renumbering what's left everywhere. */
function compact(
  net: VectorNetwork,
  vertices: ReadonlySet<number>,
  segments: ReadonlySet<number>,
): VectorNetwork {
  const vertexIndex = new Map<number, number>();
  const keptVertices = net.vertices.filter((_, i) => {
    if (vertices.has(i)) return false;
    vertexIndex.set(i, vertexIndex.size);
    return true;
  });
  const segmentIndex = new Map<number, number>();
  const keptSegments = net.segments
    .map((segment, i) => ({ segment, i }))
    .filter(
      ({ segment, i }) =>
        !segments.has(i) && vertexIndex.has(segment.start) && vertexIndex.has(segment.end),
    )
    .map(({ segment, i }) => {
      segmentIndex.set(i, segmentIndex.size);
      return {
        ...segment,
        start: vertexIndex.get(segment.start)!,
        end: vertexIndex.get(segment.end)!,
      };
    });
  const regions = net.regions
    .filter((region) => region.loops.every((loop) => loop.every((i) => segmentIndex.has(i))))
    .map((region) => ({
      ...region,
      loops: region.loops.map((loop) => loop.map((i) => segmentIndex.get(i)!)),
    }));
  return { vertices: keptVertices, segments: keptSegments, regions };
}

/**
 * Cuts a segment at `t`: it splits there into two segments that no longer share the cut vertex
 * (a closed shape opens). Regions through it are dropped.
 */
export function cutSegment(net: VectorNetwork, segment: number, t: number): VectorNetwork {
  const { network, vertex } = splitSegment(net, segment, t);
  const twin = network.vertices.push({ ...network.vertices[vertex]! }) - 1;
  const added = network.segments.length - 1;
  network.segments[added] = { ...network.segments[added]!, start: twin };
  network.regions = network.regions.filter((r) => r.loops.every((l) => !l.includes(segment)));
  return network;
}

/** Curves a segment so it passes through `target` at `t`. */
export function bendSegment(
  net: VectorNetwork,
  segment: number,
  t: number,
  target: Point,
): VectorNetwork {
  const next = copy(net);
  const curve = segmentCurve(net, segment);
  const [c1, c2] = bendThrough(curve, t, target);
  next.segments[segment] = segmentFor(next.segments[segment]!.start, next.segments[segment]!.end, [
    curve[0],
    c1,
    c2,
    curve[3],
  ]);
  return next;
}

/** How long a smooth vertex's tangents are, as a share of the distance to each neighbor. */
const SMOOTH_SHARE = 1 / 3;

/**
 * Makes a vertex sharp (its tangents removed) or, when it's sharp and joins two segments, smooth
 * (tangents along the line between its neighbors).
 */
export function toggleSmooth(net: VectorNetwork, vertex: number): VectorNetwork {
  const around = segmentsAt(net, vertex);
  const sharp = around.every((i) => {
    const t = tangentAt(net.segments[i]!, vertex);
    return t.x === 0 && t.y === 0;
  });
  let next = net;
  if (!sharp || around.length !== 2) {
    for (const i of around) next = setTangent(next, i, vertex, ZERO, false);
    return next;
  }
  const at = net.vertices[vertex]!;
  const [a, b] = around.map((i) => net.vertices[otherEnd(net.segments[i]!, vertex)]!) as [
    Point,
    Point,
  ];
  const direction = sub(b, a);
  const length = Math.hypot(direction.x, direction.y) || 1;
  const unit = { x: direction.x / length, y: direction.y / length };
  const toward = (neighbor: Point, sign: number) => {
    const reach = Math.hypot(neighbor.x - at.x, neighbor.y - at.y) * SMOOTH_SHARE;
    return { x: unit.x * reach * sign, y: unit.y * reach * sign };
  };
  next = setTangent(next, around[0]!, vertex, toward(a, -1), false);
  return setTangent(next, around[1]!, vertex, toward(b, 1), false);
}
