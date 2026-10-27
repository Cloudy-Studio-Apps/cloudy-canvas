import type { StyleRecord } from "@canvas";

import type { DesignNode } from "../node/design-node.types";
import { isGradientPaint } from "../node/gradient-paint";
import type { Paint } from "../node/paint.types";
import type { PaintStyleValue } from "./paint-style.types";
import { t } from "../core.i18n";

const PAINT_TYPES = new Set(["solid", "image", "linear", "radial", "angular", "diamond"]);

function isPaint(value: unknown): value is Paint {
  return (
    typeof value === "object" &&
    value !== null &&
    PAINT_TYPES.has(String((value as { type?: unknown }).type))
  );
}

/** A stored paint style's stack (paints of unknown types left out), or `null` when it has none. */
export function readPaintStyle(value: Readonly<Record<string, unknown>>): PaintStyleValue | null {
  if (!Array.isArray(value.paints)) return null;
  return { paints: value.paints.filter(isPaint) };
}

/** A node's fills or strokes as a paint style's value. */
export function paintStyleOfNode(node: DesignNode, field: "fills" | "strokes"): PaintStyleValue {
  return { paints: structuredClone(node[field]) };
}

/** How the Styles list sums a paint style up: its color, its gradient's type, or its count. */
export function paintStyleSummary(style: StyleRecord): string {
  const paints = readPaintStyle(style.value)?.paints ?? [];
  const [only] = paints;
  if (paints.length !== 1 || !only)
    return paints.length === 0
      ? t("styles.empty")
      : t("styles.paintCount", { count: paints.length });
  if (only.type === "solid") return only.color.toUpperCase();
  if (isGradientPaint(only)) return only.type[0]?.toUpperCase() + only.type.slice(1);
  return t("styles.image");
}
