import { smoothPoints, type ElementSpec } from "@canvas";

import { HIGHLIGHTER_COLORS, HIGHLIGHTER_SIZES, MARKER_COLORS, MARKER_SIZES } from "../../palette";
import { createStroke } from "./stroke.factory";
import { STROKE_DEFAULTS } from "./stroke.defaults";
import type { StrokeElement, StrokePen } from "./stroke.types";

const PENS: readonly StrokePen[] = ["pen", "highlighter"];

/** The stroke fields of `create_shapes`. */
export const STROKE_SPEC_PROPERTIES = {
  points: {
    type: "array",
    items: { type: "number" },
    description:
      "Stroke only: world points as a flat list [x0, y0, x1, y1, …] (at least two points). " +
      "x/y/w/h are ignored; the bounds follow the points.",
  },
  pen: { enum: PENS, description: "Stroke only: pen (default) or highlighter (translucent)." },
  size: {
    type: "number",
    description: `Stroke only: thickness (pen ${MARKER_SIZES[1].value}, highlighter ${HIGHLIGHTER_SIZES[1].value} by default).`,
  },
  smooth: { type: "boolean", description: "Stroke only: smooth the points into rounded curves." },
};

/** A stroke from an agent's spec. */
export function buildStroke(spec: ElementSpec, index: string): StrokeElement {
  const { args } = spec;
  const pen = args.pen ?? STROKE_DEFAULTS.pen;
  if (!PENS.includes(pen as StrokePen))
    throw new Error(`"pen" must be one of: ${PENS.join(", ")}.`);
  const highlighter = pen === "highlighter";
  const size =
    strokeSizeFrom(args.size) ?? (highlighter ? HIGHLIGHTER_SIZES : MARKER_SIZES)[1].value;
  const color = spec.color ?? (highlighter ? HIGHLIGHTER_COLORS : MARKER_COLORS)[0].value;
  const points = pointsFrom(args.points);
  const final =
    args.smooth === true
      ? smoothPoints(points, STROKE_DEFAULTS.smoothTolerance, STROKE_DEFAULTS.smoothPasses)
      : points;
  return createStroke(final, pen as StrokePen, color, size, index);
}

/** A stroke thickness from an agent, or `undefined` when not given. */
export function strokeSizeFrom(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const { maxSize } = STROKE_DEFAULTS;
  if (typeof value !== "number" || value <= 0 || value > maxSize) {
    throw new Error(`"size" must be a number above 0 and at most ${maxSize}.`);
  }
  return value;
}

function pointsFrom(value: unknown): number[] {
  const valid =
    Array.isArray(value) &&
    value.length >= 4 &&
    value.length % 2 === 0 &&
    value.every((n) => typeof n === "number" && Number.isFinite(n));
  if (!valid) {
    throw new Error(
      'A stroke needs "points": a flat list [x0, y0, x1, y1, …] of at least two points.',
    );
  }
  return value as number[];
}
