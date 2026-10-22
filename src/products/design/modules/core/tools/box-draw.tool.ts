import {
  rectFromPoints,
  roundPoint,
  type CanvasPointer,
  type ElementPatch,
  type Point,
  type Rect,
  type ToolContext,
} from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import type { BoxShapeKind, DesignNode } from "../node";
import { NodeDrawTool } from "./node-draw.tool";

/** Smallest node a drag draws, in world units (a design's pixels). */
const MIN_SIZE = 1;

/**
 * Draws the nodes of a `BoxShapeKind` (rectangles, ellipses, frames, polygons, stars, plugins'
 * shapes): drag to draw one (Shift for equal sides), or click to place one of the kind's
 * `clickSize`. Its id is the kind's `tool`, and its layers are named after the kind.
 */
export class BoxDrawTool<E extends DesignNode> extends NodeDrawTool<E, Rect> {
  readonly id: string;

  constructor(
    ctx: ToolContext<DesignToolOptions>,
    private readonly kind: BoxShapeKind<E>,
  ) {
    super(ctx);
    this.id = kind.tool ?? kind.type;
  }

  protected layerName(): string {
    return this.kind.label;
  }

  protected dragShape(from: Point, to: CanvasPointer): Rect {
    let end: Point = to.world;
    if (to.shiftKey) {
      const size = Math.max(Math.abs(end.x - from.x), Math.abs(end.y - from.y));
      end = {
        x: from.x + Math.sign(end.x - from.x || 1) * size,
        y: from.y + Math.sign(end.y - from.y || 1) * size,
      };
    }
    const rect = rectFromPoints(roundPoint(from), roundPoint(end));
    return { ...rect, w: Math.max(MIN_SIZE, rect.w), h: Math.max(MIN_SIZE, rect.h) };
  }

  protected clickShape(at: Point): Rect {
    const { w, h } = this.kind.clickSize(this.ctx.getOptions());
    return { ...roundPoint({ x: at.x - w / 2, y: at.y - h / 2 }), w, h };
  }

  protected createNode(rect: Rect, name: string, index: string): E {
    return this.kind.createNode(rect, name, index, null, this.ctx.getOptions());
  }

  protected shapePatch(rect: Rect): ElementPatch<E> {
    return rect as ElementPatch<E>;
  }
}
