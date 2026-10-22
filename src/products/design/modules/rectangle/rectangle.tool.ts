import type { Rect, Size } from "@canvas";

import { BoxDrawTool } from "../core";
import { createRectangle } from "./rectangle.factory";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import type { RectangleElement } from "./rectangle.types";

/** Draws rectangles (R): drag, Shift for a square, or click for a 100×100 one. */
export class RectangleTool extends BoxDrawTool<RectangleElement> {
  readonly id = "rectangle";
  protected readonly layerName = "Rectangle";

  protected clickSize(): Size {
    return RECTANGLE_DEFAULTS.size;
  }

  protected createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
  ): RectangleElement {
    return createRectangle(rect, name, index, parentId, this.ctx.getOptions().rectangleFill);
  }
}
