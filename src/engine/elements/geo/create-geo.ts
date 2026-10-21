import { createId } from "@core";

import type { Rect } from "../../geometry.types";
import { GEO_FONT_SIZE } from "./geo-defaults";
import type { GeoElement, GeoVariantId } from "./geo.types";

export function createGeo(
  rect: Rect,
  kind: GeoVariantId,
  fill: string,
  stroke: string,
  index: string,
): GeoElement {
  return {
    id: createId(),
    type: "geo",
    index,
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(rect.w),
    h: Math.round(rect.h),
    kind,
    fill,
    stroke,
    text: "",
    fontSize: GEO_FONT_SIZE,
  };
}
