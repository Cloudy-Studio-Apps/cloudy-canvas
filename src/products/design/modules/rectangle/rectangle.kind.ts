import type { ElementView } from "@canvas";

import { DesignNodeKind } from "../core";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import { drawRectangle } from "./rectangle.draw";
import type { RectangleElement } from "./rectangle.types";

export class RectangleKind extends DesignNodeKind<RectangleElement> {
  readonly type = "rectangle";
  readonly label = "Rectangle";
  readonly description = "A box with fills, strokes and rounded corners.";
  override readonly tool = "rectangle";
  override readonly defaults = RECTANGLE_DEFAULTS;

  draw(view: ElementView, el: RectangleElement): void {
    drawRectangle(view, el);
  }

  override fillDefaults(el: RectangleElement): RectangleElement {
    return { ...super.fillDefaults(el), cornerRadius: el.cornerRadius ?? 0 };
  }
}
