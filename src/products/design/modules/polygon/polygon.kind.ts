import {
  type BindableField,
  type ResolvedValue,
  clamp,
  type ElementBuildContext,
  type ElementPatch,
  type ElementSpec,
  type Point,
  type Rect,
} from "@canvas";

import {
  numberField,
  pointsInBox,
  PointsShapeKind,
  wholeNumber,
  type NodeBuildContext,
} from "../core";
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

  override bindable(el: PolygonElement): BindableField[] {
    return [...super.bindable(el), numberField("pointCount", "other-number", "Points")];
  }

  override bindValues(
    el: PolygonElement,
    path: string,
    value: ResolvedValue,
  ): Record<string, unknown> {
    if (value.type !== "number") return super.bindValues(el, path, value);
    const n = value.number;
    const { minPoints, maxPoints } = POLYGON_DEFAULTS;
    if (path === "pointCount") {
      return { pointCount: Math.min(maxPoints, Math.max(minPoints, Math.round(n))) };
    }
    return super.bindValues(el, path, value);
  }
  override readonly specProperties = {
    pointCount: {
      type: "integer",
      description: "Polygon: number of sides (3 by default); star: number of points (5).",
    },
  };

  createNode(rect: Rect, name: string, index: string, parentId: string | null): PolygonElement {
    return createPolygon(rect, name, index, parentId);
  }

  protected override nodeFromSpec(
    spec: ElementSpec,
    index: string,
    context: NodeBuildContext,
  ): PolygonElement {
    const polygon = super.nodeFromSpec(spec, index, context);
    const count = spec.args.pointCount;
    return count === undefined ? polygon : { ...polygon, pointCount: this.pointCount(count) };
  }

  override completePatch(
    el: PolygonElement,
    patch: ElementPatch<PolygonElement>,
    context: ElementBuildContext,
  ): ElementPatch<PolygonElement> {
    if ("pointCount" in patch) this.pointCount(patch.pointCount);
    return super.completePatch(el, patch, context);
  }

  private pointCount(value: unknown): number {
    return wholeNumber(value, "pointCount", POLYGON_DEFAULTS.minPoints, POLYGON_DEFAULTS.maxPoints);
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
