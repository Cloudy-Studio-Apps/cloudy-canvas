import { clamp, type Point, type Rect } from "@canvas";

import { pointsInBox, PointsShapeKind } from "../core";
import { POLYGON_DEFAULTS } from "./polygon.defaults";
import { createPolygon } from "./polygon.factory";
import type { PolygonElement } from "./polygon.types";

/** Regular polygons (a triangle by default), stretched to their box. */
export class PolygonKind extends PointsShapeKind<PolygonElement> {
  readonly type = "polygon";
  readonly label = "Polygon";
  readonly description = "A triangle or any regular polygon.";
  override readonly tool = "polygon";
  override readonly defaults = POLYGON_DEFAULTS;

  createNode(rect: Rect, name: string, index: string, parentId: string | null): PolygonElement {
    return createPolygon(rect, name, index, parentId);
  }

  /** The corners, the first one at the top. */
  points(el: PolygonElement): Point[] {
    const { minPoints, maxPoints } = POLYGON_DEFAULTS;
    const count = clamp(Math.round(el.pointCount), minPoints, maxPoints);
    return pointsInBox(count, () => 1, el.w, el.h);
  }

  override fillDefaults(el: PolygonElement): PolygonElement {
    return { ...super.fillDefaults(el), pointCount: el.pointCount ?? POLYGON_DEFAULTS.pointCount };
  }
}
