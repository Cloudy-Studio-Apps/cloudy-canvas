import { optionalChoice, optionalNumber } from "@canvas";

import type { DesignNodeKind } from "./design-node.kind";
import type { StrokeFields } from "./stroke-args.types";
import { nonNegative } from "./number-args";

export const STROKE_ALIGNS = ["inside", "center", "outside"] as const;
export const STROKE_CAPS = ["none", "round", "square"] as const;
export const STROKE_JOINS = ["miter", "bevel", "round"] as const;

/**
 * The stroke settings among an agent's fields, checked: `strokeAlign`, `strokeCap`, `strokeJoin`,
 * `strokeMiterAngle` (1–180 degrees), `strokeDashes` (lengths of at least 0) and `strokeWeights`
 * (`{ top, right, bottom, left }` or null, on kinds with sides; `strokeWeight` becomes the widest).
 * Throws naming the field.
 */
export function readStrokeFields(
  kind: DesignNodeKind,
  fields: Record<string, unknown>,
): StrokeFields {
  const out: StrokeFields = {};
  const align = optionalChoice(fields, "strokeAlign", STROKE_ALIGNS);
  if (align !== undefined) out.strokeAlign = align;
  const cap = optionalChoice(fields, "strokeCap", STROKE_CAPS);
  if (cap !== undefined) out.strokeCap = cap;
  const join = optionalChoice(fields, "strokeJoin", STROKE_JOINS);
  if (join !== undefined) out.strokeJoin = join;
  const angle = optionalNumber(fields, "strokeMiterAngle");
  if (angle !== undefined) {
    if (!(angle >= 1 && angle <= 180)) {
      throw new Error('"strokeMiterAngle" must be from 1 to 180 degrees.');
    }
    out.strokeMiterAngle = angle;
  }
  if (fields.strokeDashes !== undefined) {
    const dashes = fields.strokeDashes;
    if (!Array.isArray(dashes)) {
      throw new Error('"strokeDashes" must be an array of dash and gap lengths ([] for solid).');
    }
    out.strokeDashes = dashes.map((n, i) => nonNegative(n, `strokeDashes[${i}]`));
  }
  if (fields.strokeWeights !== undefined) {
    const sides = fields.strokeWeights as Record<string, unknown> | null;
    if (sides === null) out.strokeWeights = null;
    else {
      if (!kind.sidedStrokes) throw new Error(`A ${kind.label} has no sides to stroke apart.`);
      if (typeof sides !== "object") {
        throw new Error('"strokeWeights" must be { top, right, bottom, left } or null.');
      }
      const weights = {
        top: nonNegative(sides.top, "strokeWeights.top"),
        right: nonNegative(sides.right, "strokeWeights.right"),
        bottom: nonNegative(sides.bottom, "strokeWeights.bottom"),
        left: nonNegative(sides.left, "strokeWeights.left"),
      };
      out.strokeWeights = weights;
      out.strokeWeight = Math.max(weights.top, weights.right, weights.bottom, weights.left);
    }
  }
  return out;
}
