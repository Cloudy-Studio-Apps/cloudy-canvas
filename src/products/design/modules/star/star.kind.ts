import type { ElementView, Point } from "@canvas";

import { DesignNodeKind, distanceToOutline, drawPaints, pointInPolygon } from "../core";
import { STAR_DEFAULTS } from "./star.defaults";
import { starPoints } from "./star-points";
import type { StarElement } from "./star.types";

/** Stars, hit inside their outline. */
export class StarKind extends DesignNodeKind<StarElement> {
  readonly type = "star";
  readonly label = "Star";
  readonly description = "A star with any number of points.";
  override readonly tool = "star";
  override readonly defaults = STAR_DEFAULTS;

  draw(view: ElementView, el: StarElement): void {
    const points = starPoints(el);
    drawPaints(view, el, (g) => g.poly(points));
  }

  override hitTest(el: StarElement, p: Point, tolerance: number): boolean {
    if (!super.hitTest(el, p, tolerance)) return false;
    const local = { x: p.x - el.x, y: p.y - el.y };
    const points = starPoints(el);
    return pointInPolygon(points, local) || distanceToOutline(points, local) <= tolerance;
  }

  override fillDefaults(el: StarElement): StarElement {
    return {
      ...super.fillDefaults(el),
      pointCount: el.pointCount ?? STAR_DEFAULTS.pointCount,
      innerRadius: el.innerRadius ?? STAR_DEFAULTS.innerRadius,
    };
  }
}
