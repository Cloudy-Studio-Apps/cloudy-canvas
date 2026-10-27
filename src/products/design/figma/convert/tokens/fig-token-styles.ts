import type { StyleRecord } from "@canvas";
import type { FigImportContext, FigNode } from "@canvas/figma";
import { createId } from "@shared/core";

import { EFFECT_STYLE, PAINT_STYLE, TEXT_STYLE, type TextStyleValue } from "../../../modules";
import { figEffects } from "../fig-effects";
import { convertPaintsFrom } from "../fig-paints";
import { textFields } from "../fig-text";
import { figPaintBindings } from "./fig-bindings";
import { keyBetween } from "@canvas";

/**
 * The file's shared styles as ours: text styles (typography), color styles (`FILL`: a paint
 * stack, its colors bound to the variables they use) and effect styles; grids have no
 * counterpart and are counted. Ids are recorded in `ctx` for the layers that use them.
 */
export function figStyles(nodes: readonly FigNode[], ctx: FigImportContext): StyleRecord[] {
  const styles: StyleRecord[] = [];
  const orders = new Map<string, string | null>();
  const sorted = nodes
    .filter((n) => n.styleType && n.styleType !== "NONE" && n.phase !== "REMOVED")
    .sort((a, b) => ((a.sortPosition ?? "") < (b.sortPosition ?? "") ? -1 : 1));
  for (const node of sorted) {
    const style = figStyle(node, ctx);
    if (!style) {
      ctx.warnings.add(`${(node.styleType ?? "").toLowerCase()} styles were left out`);
      continue;
    }
    const order = keyBetween(orders.get(style.styleType) ?? null, null);
    orders.set(style.styleType, order);
    ctx.setTokenId(node.guid, style.id, node.key);
    styles.push({ ...style, order });
  }
  return styles;
}

function figStyle(node: FigNode, ctx: FigImportContext): StyleRecord | null {
  const base = {
    kind: "style" as const,
    id: createId(),
    name: node.name || "Style",
    description: node.description ?? "",
    order: "a0",
  };
  if (node.styleType === "TEXT") {
    const text = textFields(node, ctx);
    const value: TextStyleValue = {
      fontFamily: text.fontFamily,
      fontSize: text.fontSize,
      fontWeight: text.fontWeight,
      fontStyle: text.fontStyle,
      lineHeight: text.lineHeight,
      letterSpacing: text.letterSpacing,
      textDecoration: text.textDecoration,
    };
    return { ...base, styleType: TEXT_STYLE, value: { ...value } };
  }
  if (node.styleType === "FILL") {
    const { paints, from } = convertPaintsFrom(node.fillPaints, ctx, true);
    const bindings = figPaintBindings(node.fillPaints, from, "paints", ctx);
    return {
      ...base,
      styleType: PAINT_STYLE,
      value: { paints },
      ...(Object.keys(bindings).length > 0 ? { bindings } : {}),
    };
  }
  if (node.styleType === "EFFECT") {
    return { ...base, styleType: EFFECT_STYLE, value: { effects: figEffects(node, ctx) } };
  }
  return null;
}
