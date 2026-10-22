import type { Rect } from "@canvas";
import type { FigImportContext, FigNode } from "@canvas/figma";

import { createNodeBase, type DesignNode } from "../../modules";
import { convertPaints } from "./fig-paints";
import type { NodePaints, NodePlacement } from "./convert-node.types";

/**
 * The design node fields of a Figma node: its name, place in the tree and page, visibility,
 * lock, opacity, fills and strokes (`fills` replaces its fills, e.g. a stroke outline's).
 */
export function figNodeBase<K extends string>(
  type: K,
  node: FigNode,
  rect: Rect,
  placement: NodePlacement,
  ctx: FigImportContext,
  paints: NodePaints = {},
): DesignNode & { type: K } {
  if (node.effects?.length) ctx.warnings.add("shadows and blurs were left out");
  const base = createNodeBase(type, rect, placement.index, {
    name: node.name ?? "",
    parentId: placement.parentId,
    fills: paints.fills ?? convertPaints(node.fillPaints, ctx, paints.allowImages),
  });
  return {
    ...base,
    pageId: placement.pageId,
    visible: node.visible ?? true,
    opacity: node.opacity ?? 1,
    strokes: paints.strokes ?? convertPaints(node.strokePaints, ctx, false),
    strokeWeight: node.strokeWeight ?? 0,
    ...(node.locked ? { locked: true } : {}),
  };
}
