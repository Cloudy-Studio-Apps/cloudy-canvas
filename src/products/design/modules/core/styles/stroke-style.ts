import type { BoxSides, StyleRecord } from "@canvas";

import type { DesignNode } from "../node/design-node.types";
import type { StrokeStyleValue } from "./stroke-style.types";
import { t } from "../core.i18n";

const ALIGNS = new Set(["inside", "center", "outside"]);
const CAPS = new Set(["none", "round", "square"]);
const JOINS = new Set(["miter", "bevel", "round"]);
const SIDES = ["top", "right", "bottom", "left"] as const;

function isSides(value: unknown): value is BoxSides {
  if (typeof value !== "object" || value === null) return false;
  const sides = value as Record<string, unknown>;
  return SIDES.every((side) => typeof sides[side] === "number" && (sides[side] as number) >= 0);
}

/** A stored stroke style's settings a node takes (anything else, or invalid, left out). */
export function readStrokeStyle(
  value: Readonly<Record<string, unknown>>,
): Partial<StrokeStyleValue> {
  const out: Partial<StrokeStyleValue> = {};
  if (typeof value.strokeWeight === "number" && value.strokeWeight >= 0) {
    out.strokeWeight = value.strokeWeight;
  }
  if (value.strokeWeights === null || isSides(value.strokeWeights)) {
    out.strokeWeights = value.strokeWeights;
  }
  if (typeof value.strokeAlign === "string" && ALIGNS.has(value.strokeAlign)) {
    out.strokeAlign = value.strokeAlign as StrokeStyleValue["strokeAlign"];
  }
  if (typeof value.strokeCap === "string" && CAPS.has(value.strokeCap)) {
    out.strokeCap = value.strokeCap as StrokeStyleValue["strokeCap"];
  }
  if (typeof value.strokeJoin === "string" && JOINS.has(value.strokeJoin)) {
    out.strokeJoin = value.strokeJoin as StrokeStyleValue["strokeJoin"];
  }
  if (typeof value.strokeMiterAngle === "number" && value.strokeMiterAngle > 0) {
    out.strokeMiterAngle = value.strokeMiterAngle;
  }
  if (
    Array.isArray(value.strokeDashes) &&
    value.strokeDashes.every((n) => typeof n === "number" && n >= 0)
  ) {
    out.strokeDashes = value.strokeDashes as number[];
  }
  return out;
}

/** A node's stroke settings as a stroke style's value. */
export function strokeStyleOfNode(node: DesignNode): StrokeStyleValue {
  return {
    strokeWeight: node.strokeWeight,
    strokeWeights: node.strokeWeights ? { ...node.strokeWeights } : null,
    strokeAlign: node.strokeAlign,
    strokeCap: node.strokeCap,
    strokeJoin: node.strokeJoin,
    strokeMiterAngle: node.strokeMiterAngle,
    strokeDashes: [...node.strokeDashes],
  };
}

/** "2 · Inside · Dashed". */
export function strokeStyleSummary(style: StyleRecord): string {
  const value = readStrokeStyle(style.value);
  const weight = value.strokeWeights ? t("styles.sides") : String(value.strokeWeight ?? 1);
  const align = value.strokeAlign ?? "inside";
  const parts = [weight, t(`stroke.align.${align}`)];
  if (value.strokeDashes && value.strokeDashes.length > 0) parts.push(t("styles.dashedSummary"));
  return parts.join(" · ");
}
