import type { Point } from "../geometry.types";

/** How a gradient spreads its stops: along a line, out from a center, round it, or as a diamond. */
export type GradientType = "linear" | "radial" | "angular" | "diamond";

/** How the colors blend from a stop to the next one. */
export type StopEase = "linear" | "ease-in" | "ease-out" | "ease-in-out";

/** How stops are mixed: in sRGB (Figma's), or in OKLab, which keeps the middle from going gray. */
export type GradientInterpolation = "srgb" | "oklab";

/** One color of a gradient. */
export interface ColorStop {
  /** 0–1 along the gradient. */
  position: number;
  /** `#RRGGBB`. */
  color: string;
  /** 0–1. */
  opacity: number;
  /** How the blend to the next stop runs (`linear` when unset). */
  ease?: StopEase;
}

/**
 * Figma's gradient transform, a 2×3 affine matrix `[[a, c, e], [b, d, f]]` taking a point of the
 * element's box, normalized to 0–1 on both axes, to gradient space. There a linear gradient runs
 * along x from 0 to 1, a radial or diamond one fills the circle (diamond) round (0.5, 0.5) of
 * radius 0.5 and an angular one turns round (0.5, 0.5), clockwise from +x.
 */
export type GradientTransform = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
];

/** What a gradient looks like, independent of the element it paints. */
export interface Gradient {
  type: GradientType;
  /** At least two, in any order (they're sorted when drawn). */
  stops: ColorStop[];
  transform: GradientTransform;
  /** `srgb` when unset. */
  interpolation?: GradientInterpolation;
}

/**
 * The handles a gradient is edited with, in the box's normalized space: `start` and `end` (for a
 * radial, angular or diamond gradient, its center and the end of its radius), and `width`, the
 * end of its other radius (unused by linear gradients, which keep their lines square to the
 * start–end line).
 */
export interface GradientHandles {
  start: Point;
  end: Point;
  width: Point;
}
