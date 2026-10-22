import type { Rect, Size } from "@canvas";

import { BoxDrawTool } from "../core";
import { STAR_DEFAULTS } from "./star.defaults";
import { createStar } from "./star.factory";
import type { StarElement } from "./star.types";

/** Draws stars: drag, Shift for equal sides, or click for a 100×100 one. */
export class StarTool extends BoxDrawTool<StarElement> {
  readonly id = "star";
  protected readonly layerName = "Star";

  protected clickSize(): Size {
    return STAR_DEFAULTS.size;
  }

  protected createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
  ): StarElement {
    return createStar(rect, name, index, parentId);
  }
}
