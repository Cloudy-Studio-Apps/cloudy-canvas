import type { FigNode } from "@canvas/figma";

import type { DesignNode, StrokeCap, StrokeJoin } from "../../modules";

/** Figma's caps that end a stroke as ours do (its arrows are left to the lines' own caps). */
const CAPS: Record<string, StrokeCap> = { NONE: "none", ROUND: "round", SQUARE: "square" };
const JOINS: Record<string, StrokeJoin> = { MITER: "miter", BEVEL: "bevel", ROUND: "round" };
const ALIGNS = { INSIDE: "inside", CENTER: "center", OUTSIDE: "outside" } as const;

/** Figma's default miter limit (a ratio), whose angle is ours by default. */
const FIGMA_MITER_LIMIT = 4;

/**
 * A Figma node's stroke settings: where it sits, its ends, corners and miter angle, its dashes
 * and each side's weight when they're set apart.
 */
export function figStroke(
  node: FigNode,
): Pick<
  DesignNode,
  "strokeAlign" | "strokeCap" | "strokeJoin" | "strokeMiterAngle" | "strokeDashes" | "strokeWeights"
> {
  const align = ALIGNS[node.strokeAlign as keyof typeof ALIGNS] ?? "center";
  const limit = Math.max(1, node.miterLimit ?? FIGMA_MITER_LIMIT);
  return {
    strokeAlign: align,
    strokeCap: CAPS[node.strokeCap ?? ""] ?? "none",
    strokeJoin: JOINS[node.strokeJoin ?? ""] ?? "miter",
    strokeMiterAngle: Math.round(((2 * Math.asin(1 / limit) * 180) / Math.PI) * 100) / 100,
    strokeDashes: (node.dashPattern ?? []).filter((n) => Number.isFinite(n) && n >= 0),
    // A side the file leaves out has no stroke (a card with only a top border).
    strokeWeights: node.borderStrokeWeightsIndependent
      ? {
          top: node.borderTopWeight ?? 0,
          right: node.borderRightWeight ?? 0,
          bottom: node.borderBottomWeight ?? 0,
          left: node.borderLeftWeight ?? 0,
        }
      : null,
  };
}
