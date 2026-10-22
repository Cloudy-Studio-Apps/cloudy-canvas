import {
  clamp,
  type ElementBuildContext,
  type ElementPatch,
  type ElementSpec,
  type Point,
  type Rect,
} from "@canvas";

import {
  fraction,
  pointsInBox,
  PointsShapeKind,
  wholeNumber,
  type NodeBuildContext,
} from "../core";
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
  override readonly specProperties = {
    pointCount: {
      type: "integer",
      description: "Polygon: number of sides (3 by default); star: number of points (5).",
    },
    innerRadius: {
      type: "number",
      description: "Star: inner corners' distance from the center, 0–1 of the outer (0.382).",
    },
  };

  createNode(rect: Rect, name: string, index: string, parentId: string | null): StarElement {
    return createStar(rect, name, index, parentId);
  }

  protected override nodeFromSpec(
    spec: ElementSpec,
    index: string,
    context: NodeBuildContext,
  ): StarElement {
    const star = super.nodeFromSpec(spec, index, context);
    const { pointCount, innerRadius } = spec.args;
    return {
      ...star,
      ...(pointCount !== undefined ? { pointCount: this.pointCount(pointCount) } : {}),
      ...(innerRadius !== undefined ? { innerRadius: fraction(innerRadius, "innerRadius") } : {}),
    };
  }

  override completePatch(
    el: StarElement,
    patch: ElementPatch<StarElement>,
    context: ElementBuildContext,
  ): ElementPatch<StarElement> {
    if ("pointCount" in patch) this.pointCount(patch.pointCount);
    if ("innerRadius" in patch) fraction(patch.innerRadius, "innerRadius");
    return super.completePatch(el, patch, context);
  }

  private pointCount(value: unknown): number {
    return wholeNumber(value, "pointCount", STAR_DEFAULTS.minPoints, STAR_DEFAULTS.maxPoints);
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
