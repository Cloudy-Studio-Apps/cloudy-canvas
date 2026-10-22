import type { CanvasElement, ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { BoxShapeKind, isDesignNode } from "../../core";
import { createVector } from "../vector.factory";
import type { VectorElement } from "../vector.types";
import { VECTOR_EDIT } from "./vector-edit-session";
import { VECTOR_TOOLS } from "./vector-tools";

/** Whether an element is a vector. */
export function isVector(el: CanvasElement | undefined): el is VectorElement {
  return el?.type === "vector";
}

/**
 * The design's `editElement` (double-click, Enter): a vector enters the edit mode; a shape that
 * has a vector outline (rectangle, ellipse, polygon, star) first becomes a vector with the same
 * id, place and look (one undo step), as in Figma. Anything else isn't handled.
 */
export function editVector(el: CanvasElement, ctx: ToolContext<DesignToolOptions>): boolean {
  const kind = ctx.kinds.kindOf(el);
  if (!isVector(el)) {
    const network =
      kind instanceof BoxShapeKind && isDesignNode(el) ? kind.vectorNetwork(el) : null;
    if (!network || !isDesignNode(el)) return false;
    const world = {
      ...network,
      vertices: network.vertices.map((v) => ({ x: v.x + el.x, y: v.y + el.y })),
    };
    const vector: VectorElement = {
      ...createVector(world, el.name, el.index, el.parentId, el),
      id: el.id,
      visible: el.visible,
      opacity: el.opacity,
      ...(el.locked ? { locked: true } : {}),
    };
    ctx.doc.checkpoint();
    ctx.doc.remove([el.id]);
    ctx.doc.add(vector);
  }
  ctx.service(VECTOR_EDIT).start(el.id);
  ctx.setSelection([el.id]);
  ctx.setTool(VECTOR_TOOLS.move);
  return true;
}
