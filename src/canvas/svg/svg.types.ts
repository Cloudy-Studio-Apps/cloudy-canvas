import type { Point, Rect } from "../geometry.types";
import type { ColorStop, GradientTransform } from "../gradient";
import type { PathFillRule, PathShape } from "../path";

/** An SVG transform matrix, `[[a, c, e], [b, d, f]]` (the gradient module's affine type). */
export type SvgMatrix = GradientTransform;

/**
 * A gradient an SVG layer is painted with, placed in the file's user space (its transforms
 * applied): a linear one from `start` to `end`, a radial one round `start` with radii to `end`
 * and `width`.
 */
export interface SvgGradient {
  type: "linear" | "radial";
  stops: ColorStop[];
  start: Point;
  end: Point;
  width: Point;
}

/** What fills or strokes an SVG layer. */
export type SvgPaint =
  | { kind: "color"; color: string; opacity: number }
  | { kind: "gradient"; gradient: SvgGradient; opacity: number };

/** One drawn element of an SVG file (a path, rect, circle, …), in the file's user space. */
export interface SvgLayer {
  /** Its tag, or its id when it has one. */
  name: string;
  shape: PathShape;
  fill: SvgPaint | null;
  fillRule: PathFillRule;
  stroke: SvgPaint | null;
  strokeWidth: number;
  strokeCap: "butt" | "round" | "square";
  strokeJoin: "miter" | "round" | "bevel";
  /** 0–1, its own and its groups' together. */
  opacity: number;
  /** Whether it's inside the die-cut edge filter (`SvgDocument.edge`). */
  edged: boolean;
}

/** A die-cut edge drawn by a filter (the built-in stickers'): grown alpha, flooded, shadowed. */
export interface SvgEdgeFilter {
  /** How far the edge grows round the art, in user units. */
  radius: number;
  /** `#RRGGBB`. */
  color: string;
  shadow: { dx: number; dy: number; blur: number; color: string; opacity: number } | null;
}

/** An SVG file read as layers. */
export interface SvgDocument {
  /** The user space the file shows (its `viewBox`, else its size). */
  viewBox: Rect;
  /** Bottom to top. */
  layers: SvgLayer[];
  edge: SvgEdgeFilter | null;
  /** How many elements were left out (text, images, uses, masks, …). */
  skipped: number;
}

/** The presentation properties an element inherits, as written (`fill="url(#g)"`, …). */
export interface SvgStyle {
  fill: string;
  fillOpacity: number;
  fillRule: "nonzero" | "evenodd";
  stroke: string;
  strokeOpacity: number;
  strokeWidth: number;
  strokeCap: "butt" | "round" | "square";
  strokeJoin: "miter" | "round" | "bevel";
  /** Its own and its ancestors' opacity together. */
  opacity: number;
}
