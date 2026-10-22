import {
  roundPoint,
  type CanvasPointer,
  type ElementPatch,
  type Point,
  type ToolContext,
} from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { NodeDrawTool } from "../core";
import { createLine } from "./line.factory";
import { LINE_DEFAULTS } from "./line.defaults";
import { lineFromEnds, snapTo45 } from "./line-geometry";
import type { LineCap, LineEnds, LineNodeElement } from "./line.types";

/**
 * Draws a line, or an arrow with an `arrow` end cap: drag from start to end (Shift for 45° steps),
 * or click for a horizontal one.
 */
export class LineTool extends NodeDrawTool<LineNodeElement, LineEnds> {
  constructor(
    ctx: ToolContext<DesignToolOptions>,
    readonly id: string,
    private readonly endCap: LineCap,
    private readonly name: string,
  ) {
    super(ctx);
  }

  protected layerName(): string {
    return this.name;
  }

  protected dragShape(from: Point, to: CanvasPointer): LineEnds {
    const start = roundPoint(from);
    return { start, end: to.shiftKey ? snapTo45(start, to.world) : roundPoint(to.world) };
  }

  protected clickShape(at: Point): LineEnds {
    const start = roundPoint(at);
    return { start, end: { x: start.x + LINE_DEFAULTS.size.w, y: start.y } };
  }

  protected createNode({ start, end }: LineEnds, name: string, index: string): LineNodeElement {
    return createLine(start, end, name, index, null, this.endCap);
  }

  protected shapePatch({ start, end }: LineEnds): ElementPatch<LineNodeElement> {
    return lineFromEnds(start, end);
  }
}
