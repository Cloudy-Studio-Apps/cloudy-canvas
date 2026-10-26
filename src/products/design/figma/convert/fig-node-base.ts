import type { Rect } from "@canvas";
import type { FigImportContext, FigNode } from "@canvas/figma";

import { createNodeBase, type DesignNode, type MaskType } from "../../modules";
import { convertPaintsFrom } from "./fig-paints";
import { figPaintBindings } from "./tokens/fig-bindings";
import { figLayerBlendMode } from "./fig-blend-mode";
import { figSizing } from "./fig-auto-layout";
import { figEffects } from "./fig-effects";
import { figStroke } from "./fig-stroke";
import type { NodePaints, NodePlacement } from "./convert-node.types";

/**
 * The design node fields of a Figma node: its name, place in the tree and page, visibility,
 * lock, opacity, blend mode, fills and strokes (`fills` replaces its fills, e.g. a stroke
 * outline's), its effects and whether it's a mask.
 */
export function figNodeBase<K extends string>(
  type: K,
  node: FigNode,
  rect: Rect,
  placement: NodePlacement,
  ctx: FigImportContext,
  paints: NodePaints = {},
): DesignNode & { type: K } {
  const fills = paints.fills
    ? { paints: paints.fills, from: [] }
    : convertPaintsFrom(node.fillPaints, ctx, paints.allowImages);
  const strokes = paints.strokes
    ? { paints: paints.strokes, from: [] }
    : convertPaintsFrom(node.strokePaints, ctx, false);
  // The colors bound to variables, by the converted paints' places.
  const bindings = {
    ...figPaintBindings(node.fillPaints, fills.from, "fills", ctx),
    ...figPaintBindings(node.strokePaints, strokes.from, "strokes", ctx),
  };
  const base = createNodeBase(type, rect, placement.index, {
    name: node.name ?? "",
    parentId: placement.parentId,
    fills: fills.paints,
  });
  return {
    ...base,
    pageId: placement.pageId,
    visible: node.visible ?? true,
    opacity: node.opacity ?? 1,
    blendMode: figLayerBlendMode(node.blendMode, ctx),
    strokes: strokes.paints,
    strokeWeight: node.strokeWeight ?? 0,
    ...figStroke(node),
    effects: figEffects(node, ctx),
    sizing: figSizing(node, placement.parentLayout ?? null),
    layoutAbsolute: !!placement.parentLayout && node.stackPositioning === "ABSOLUTE",
    ...(node.locked ? { locked: true } : {}),
    ...(node.mask ? { isMask: true, maskType: figMaskType(node, ctx) } : {}),
    ...(Object.keys(bindings).length > 0 ? { bindings } : {}),
  };
}

/** How a Figma mask masks (alpha when Figma's type is unknown, with a warning). */
function figMaskType(node: FigNode, ctx: FigImportContext): MaskType {
  switch (node.maskType) {
    case "OUTLINE":
    case "VECTOR":
      return "vector";
    case "LUMINANCE":
      return "luminance";
    case "ALPHA":
      return "alpha";
    case undefined:
      return node.maskIsOutline ? "vector" : "alpha";
    default:
      ctx.warnings.add("unknown mask types became alpha masks");
      return "alpha";
  }
}
