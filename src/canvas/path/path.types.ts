import type { Point } from "../geometry.types";

/** A cubic bezier's four control points. */
export type CubicCurve = readonly [Point, Point, Point, Point];

/** One piece of a contour: a cubic bezier from where the previous one ended (straight when its
 * control points lie on its ends). */
export interface PathSegment {
  c1: Point;
  c2: Point;
  to: Point;
}

/**
 * A run of segments from `start`. A closed contour's last segment ends back at `start`. In a
 * normalized shape (see `normalizePath`), each outer contour is followed by its holes.
 */
export interface PathContour {
  start: Point;
  segments: PathSegment[];
  closed: boolean;
  /** A hole of the outer contour before it (normalized shapes only). */
  hole?: boolean;
}

/** An outline made of contours: what's filled, stroked, clipped or combined. */
export interface PathShape {
  contours: PathContour[];
}

/** Which parts of overlapping or self-crossing contours are inside. */
export type PathFillRule = "nonzero" | "evenodd";

/** How booleans combine their operands, as in Figma. */
export type PathOperation = "union" | "subtract" | "intersect" | "exclude";

/** A shape that takes part in a boolean, filled by its own rule. */
export interface PathOperand {
  shape: PathShape;
  fillRule: PathFillRule;
}

/** How a stroke is turned into the area it covers (`outlineStroke`). */
export interface StrokeOutlineOptions {
  width: number;
  cap?: "butt" | "round" | "square";
  join?: "miter" | "round" | "bevel";
  /** Miters longer than this many times the half width are beveled (default 4, as in Figma). */
  miterLimit?: number;
}

/** Where a stroke sits on a closed outline: within it, centered on it or around it. */
export type StrokeAlign = "inside" | "center" | "outside";

/** How a stroke's area is worked out (`strokeArea`): its outline, alignment and dashes. */
export interface StrokeAreaOptions extends StrokeOutlineOptions {
  /** Default: centered. */
  align?: StrokeAlign;
  /** Dash, gap, dash, gap… lengths (see `dashPath`); empty for a solid stroke. */
  dashes?: readonly number[];
  /** How far along each contour the pattern starts. */
  dashOffset?: number;
}

/** A value per side of a box (e.g. individual stroke weights). */
export interface BoxSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A shape's placement: its top-left corner and its turn (degrees counterclockwise round it). */
export interface PathPlacement {
  x: number;
  y: number;
  rotation?: number;
}

/** An axis-aligned box as its edges. */
export interface Extent {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Where a flattened point lies on a source curve (see `SourceTags`). */
export interface CurveTag {
  curve: CubicCurve;
  t: number;
}

/** A stretch of a source curve an output edge follows (rebuilding curves). */
export interface CurveRun {
  curve: CubicCurve;
  t0: number;
  t1: number;
}
