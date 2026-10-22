import type { ElementDefaults, Size } from "@canvas";

import type { DesignNode } from "../core";

export interface RectangleElement extends DesignNode {
  type: "rectangle";
  /** Radius of every corner, in world units. */
  cornerRadius: number;
}

export interface RectangleDefaults extends ElementDefaults {
  size: Size;
  /** Fill of new rectangles. */
  fill: string;
  cornerRadius: number;
}
