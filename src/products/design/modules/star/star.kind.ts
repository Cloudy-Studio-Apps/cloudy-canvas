import { clamp, type Point, type Rect } from "@canvas";

import { pointsInBox, PointsShapeKind } from "../core";
import { STAR_DEFAULTS } from "./star.defaults";
import { createStar } from "./star.factory";
import type { StarElement } from "./star.types";

/** Smallest inner radius, so a star never collapses to a point. */
const MIN_INNER_RADIUS = 0.01;

/** Stars, stretched to their box. */
export class StarKind extends PointsShapeKind<StarElement> {
  readonly type = "star";
  readonly label = "Star";
  readonly description = "A star with any number of points.";
  override readonly tool = "star";
  override readonly defaults = STAR_DEFAULTS;

  createNode(rect: Rect, name: string, index: string, parentId: string | null): StarElement {
    return createStar(rect, name, index, parentId);
  }

  /** The outer and inner corners in turn, the first point at the top. */
  points(el: StarElement): Point[] {
    const { minPoints, maxPoints } = STAR_DEFAULTS;
    const count = clamp(Math.round(el.pointCount), minPoints, maxPoints);
    const inner = clamp(el.innerRadius, MIN_INNER_RADIUS, 1);
    return pointsInBox(count * 2, (i) => (i % 2 === 0 ? 1 : inner), el.w, el.h);
  }

  override fillDefaults(el: StarElement): StarElement {
    return {
      ...super.fillDefaults(el),
      pointCount: el.pointCount ?? STAR_DEFAULTS.pointCount,
      innerRadius: el.innerRadius ?? STAR_DEFAULTS.innerRadius,
    };
  }
}
