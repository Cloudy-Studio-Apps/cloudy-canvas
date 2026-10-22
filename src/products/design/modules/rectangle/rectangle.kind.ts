import type { ElementView, Rect } from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { BoxShapeKind, solidPaint } from "../core";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import { drawRectangle } from "./rectangle.draw";
import { createRectangle } from "./rectangle.factory";
import type { RectangleElement } from "./rectangle.types";

export class RectangleKind extends BoxShapeKind<RectangleElement> {
  readonly type = "rectangle";
  readonly label = "Rectangle";
  readonly description = "A box with fills, strokes and rounded corners.";
  override readonly tool = "rectangle";
  override readonly defaults = RECTANGLE_DEFAULTS;

  createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
    options: DesignToolOptions,
  ): RectangleElement {
    return createRectangle(rect, name, index, parentId, [solidPaint(options.rectangleFill)]);
  }

  draw(view: ElementView, el: RectangleElement): void {
    drawRectangle(view, el);
  }

  override fillDefaults(el: RectangleElement): RectangleElement {
    return { ...super.fillDefaults(el), cornerRadius: el.cornerRadius ?? 0 };
  }
}
