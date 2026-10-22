import type { ElementDefaults, Size } from "@canvas";

import type { DesignNode } from "../core";

export interface EllipseElement extends DesignNode {
  type: "ellipse";
}

export interface EllipseDefaults extends ElementDefaults {
  size: Size;
  fill: string;
}
