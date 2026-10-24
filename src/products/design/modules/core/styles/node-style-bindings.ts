import type { BindableField, ResolvedValue } from "@canvas";

import type { DesignNodeKind } from "../node/design-node.kind";
import type { DesignNode } from "../node/design-node.types";
import { readEffectStyle } from "./effect-style";
import { readPaintStyle } from "./paint-style";
import { readStrokeStyle } from "./stroke-style";
import { EFFECT_STYLE, PAINT_STYLE, STROKE_STYLE, STROKE_STYLE_PATH } from "./style-paths";

function styleField(path: string, styleType: string, label: string): BindableField {
  return { path, type: "style", styleType, scopes: [], label };
}

/** The styles a node of this kind takes: paints on its fills and strokes, effects, a stroke. */
export function nodeStyleFields<E extends DesignNode>(kind: DesignNodeKind<E>): BindableField[] {
  return [
    ...(kind.fillable ? [styleField("fills", PAINT_STYLE, "Fill style")] : []),
    ...(kind.strokable ? [styleField("strokes", PAINT_STYLE, "Stroke color style")] : []),
    styleField("effects", EFFECT_STYLE, "Effect style"),
    ...(kind.strokable ? [styleField(STROKE_STYLE_PATH, STROKE_STYLE, "Stroke style")] : []),
  ];
}

/**
 * The fields a paint, effect or stroke style bound at `path` gives a node (`{}` for a style of
 * another type there), fitted to its kind: no pictures where it can't show them, sides only on
 * kinds with them. `null` when `path` isn't one of these styles' paths.
 */
export function nodeStyleValues<E extends DesignNode>(
  kind: DesignNodeKind<E>,
  path: string,
  value: ResolvedValue,
): Record<string, unknown> | null {
  if (value.type !== "style") return null;
  if (path === "fills" || path === "strokes") {
    const paints = value.styleType === PAINT_STYLE ? readPaintStyle(value.value) : null;
    if (!paints) return {};
    const pictures = path === "fills" && kind.imageFills;
    return {
      [path]: paints.paints.filter((paint) => pictures || paint.type !== "image"),
    };
  }
  if (path === "effects") {
    const effects = value.styleType === EFFECT_STYLE ? readEffectStyle(value.value) : null;
    return effects ? { effects: effects.effects } : {};
  }
  if (path === STROKE_STYLE_PATH) {
    if (value.styleType !== STROKE_STYLE) return {};
    const stroke = readStrokeStyle(value.value);
    if (!kind.sidedStrokes) {
      // Without sides of its own, a node takes the widest side as its weight.
      const sides = stroke.strokeWeights;
      delete stroke.strokeWeights;
      if (sides) stroke.strokeWeight = Math.max(sides.top, sides.right, sides.bottom, sides.left);
      return { ...stroke, strokeWeights: null };
    }
    return { ...stroke };
  }
  return null;
}
