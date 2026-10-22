import { createElementBase, type Rect, roundRect } from "@canvas";

import { GEO_DEFAULTS } from "./geo.defaults";
import type { GeoElement } from "./geo.types";

export function createGeo(
  rect: Rect,
  kind: string,
  fill: string,
  stroke: string,
  index: string,
): GeoElement {
  return {
    ...createElementBase("geo", roundRect(rect), index),
    kind,
    fill,
    stroke,
    text: "",
    fontSize: GEO_DEFAULTS.fontSize,
  };
}
