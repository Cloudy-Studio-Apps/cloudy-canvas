import type { Rect, Size } from "@canvas";

import { BoxDrawTool } from "../core";
import { POLYGON_DEFAULTS } from "./polygon.defaults";
import { createPolygon } from "./polygon.factory";
import type { PolygonElement } from "./polygon.types";

/** Draws polygons: drag, Shift for equal sides, or click for a 100×100 one. */
export class PolygonTool extends BoxDrawTool<PolygonElement> {
  readonly id = "polygon";
  protected readonly layerName = "Polygon";

  protected clickSize(): Size {
    return POLYGON_DEFAULTS.size;
  }

  protected createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
  ): PolygonElement {
    return createPolygon(rect, name, index, parentId);
  }
}
