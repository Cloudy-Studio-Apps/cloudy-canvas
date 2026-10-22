import type { ElementView, Point } from "@canvas";

import { DesignNodeKind, distanceToOutline, drawPaints, pointInPolygon } from "../core";
import { POLYGON_DEFAULTS } from "./polygon.defaults";
import { polygonPoints } from "./polygon-points";
import type { PolygonElement } from "./polygon.types";

/** Regular polygons (a triangle by default), hit inside their outline. */
export class PolygonKind extends DesignNodeKind<PolygonElement> {
  readonly type = "polygon";
  readonly label = "Polygon";
  readonly description = "A triangle or any regular polygon.";
  override readonly tool = "polygon";
  override readonly defaults = POLYGON_DEFAULTS;

  draw(view: ElementView, el: PolygonElement): void {
    const points = polygonPoints(el);
    drawPaints(view, el, (g) => g.poly(points));
  }

  override hitTest(el: PolygonElement, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance)) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const points = polygonPoints(el);
    return pointInPolygon(points, local) || distanceToOutline(points, local) <= tolerance;
  }

  override fillDefaults(el: PolygonElement): PolygonElement {
    return { ...super.fillDefaults(el), pointCount: el.pointCount ?? POLYGON_DEFAULTS.pointCount };
  }
}
