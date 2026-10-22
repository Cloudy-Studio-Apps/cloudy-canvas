import type { Rect, Size } from "@canvas";

import { BoxDrawTool } from "../core";
import { ELLIPSE_DEFAULTS } from "./ellipse.defaults";
import { createEllipse } from "./ellipse.factory";
import type { EllipseElement } from "./ellipse.types";

/** Draws ellipses (O): drag, Shift for a circle, or click for a 100×100 one. */
export class EllipseTool extends BoxDrawTool<EllipseElement> {
  readonly id = "ellipse";
  protected readonly layerName = "Ellipse";

  protected clickSize(): Size {
    return ELLIPSE_DEFAULTS.size;
  }

  protected createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
  ): EllipseElement {
    return createEllipse(rect, name, index, parentId);
  }
}
