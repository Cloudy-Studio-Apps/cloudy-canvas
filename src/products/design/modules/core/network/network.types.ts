import type { Point } from "@canvas";

/**
 * A curve between two vertices: a cubic bezier whose control points are the vertices plus their
 * tangents (relative; `{ x: 0, y: 0 }` is a straight end), as in Figma's vector networks.
 */
export interface VectorSegment {
  start: number;
  end: number;
  tangentStart: Point;
  tangentEnd: Point;
}

/** How a region with several loops is filled (holes are drawn filled for now). */
export type WindingRule = "nonzero" | "evenodd";

/** A filled area: closed loops of segment indices (the first is its outline). */
export interface VectorRegion {
  loops: number[][];
  windingRule: WindingRule;
}

/**
 * Figma's vector network: vertices (local coordinates) joined by bezier segments that may
 * branch, and the regions they close that are filled. Stored as plain JSON in the node.
 */
export interface VectorNetwork {
  vertices: Point[];
  segments: VectorSegment[];
  regions: VectorRegion[];
}

/** A cubic bezier's four control points. */
export type CubicCurve = readonly [Point, Point, Point, Point];

/** Where a point lies near a segment: its index, the curve parameter and the distance. */
export interface SegmentHit {
  segment: number;
  t: number;
  distance: number;
}

/** An area the segments enclose: its loop of segments (in order) and its flattened outline. */
export interface NetworkFace {
  loop: number[];
  polygon: Point[];
  /** Its area (positive). */
  area: number;
}

/** A segment walked one way: `forward` from its start to its end (finding faces). */
export interface HalfEdge {
  segment: number;
  forward: boolean;
}
