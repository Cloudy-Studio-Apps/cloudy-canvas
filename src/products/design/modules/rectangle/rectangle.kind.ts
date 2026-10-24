import {
  type BindableField,
  type ResolvedValue,
  boxSidesStroke,
  type BoxSides,
  type PathShape,
  scaleLength,
  type ElementBuildContext,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type Rect,
  type ScaleTransform,
} from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import {
  BoxShapeKind,
  EMPTY_GEOMETRY,
  NODE_STYLE_FIELDS,
  nonNegative,
  rectNetwork,
  solidPaint,
  type NodeBuildContext,
  type VectorNetwork,
  numberField,
} from "../core";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import { drawRectangle } from "./rectangle.draw";
import { createRectangle } from "./rectangle.factory";
import type { RectangleElement } from "./rectangle.types";

export class RectangleKind extends BoxShapeKind<RectangleElement> {
  readonly type = "rectangle";
  readonly label = "Rectangle";
  readonly description = "A box with fills, strokes and rounded corners.";
  override readonly tool = "rectangle";
  override readonly defaults = RECTANGLE_DEFAULTS;
  override readonly styleFields = [...NODE_STYLE_FIELDS, "cornerRadius"];
  override readonly sidedStrokes = true;

  override bindable(el: RectangleElement): BindableField[] {
    return [...super.bindable(el), numberField("cornerRadius", "corner-radius", "Corner radius")];
  }

  override bindValues(
    el: RectangleElement,
    path: string,
    value: ResolvedValue,
  ): Record<string, unknown> {
    if (path === "cornerRadius" && value.type === "number") {
      return { cornerRadius: Math.max(0, value.number) };
    }
    return super.bindValues(el, path, value);
  }

  /** Each side's own weight round its (rounded) box. */
  protected override sidedStrokeArea(el: RectangleElement, sides: BoxSides): PathShape {
    return boxSidesStroke(el.w, el.h, el.cornerRadius, sides, el.strokeAlign);
  }

  /** Undashed, and its corners round or mitered (inside, joins don't show). */
  protected override boxStroke(el: RectangleElement): boolean {
    if (el.strokeDashes.length > 0) return false;
    return el.strokeAlign === "inside" || el.strokeJoin === "miter" || el.cornerRadius > 0;
  }
  override readonly specProperties = {
    cornerRadius: { type: "number", description: "Frame or rectangle: corner radius." },
  };

  createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
    options: DesignToolOptions,
  ): RectangleElement {
    return createRectangle(rect, name, index, parentId, [solidPaint(options.rectangleFill)]);
  }

  protected override nodeFromSpec(
    spec: ElementSpec,
    index: string,
    context: NodeBuildContext,
  ): RectangleElement {
    const rect = super.nodeFromSpec(spec, index, context);
    const radius = spec.args.cornerRadius;
    return radius === undefined
      ? rect
      : { ...rect, cornerRadius: nonNegative(radius, "cornerRadius") };
  }

  override completePatch(
    el: RectangleElement,
    patch: ElementPatch<RectangleElement>,
    context: ElementBuildContext,
  ): ElementPatch<RectangleElement> {
    if ("cornerRadius" in patch) nonNegative(patch.cornerRadius, "cornerRadius");
    return super.completePatch(el, patch, context);
  }

  override vectorNetwork(el: RectangleElement): VectorNetwork {
    return rectNetwork(el.w, el.h, el.cornerRadius);
  }

  override geometryKey(el: RectangleElement): string {
    return `${el.w},${el.h},${el.cornerRadius}`;
  }

  draw(view: ElementView, el: RectangleElement): void {
    drawRectangle(view, el, this.geometry(el) ?? EMPTY_GEOMETRY, this.strokeOf(el));
  }

  /** Its corners round in proportion. */
  override scale(el: RectangleElement, t: ScaleTransform): ElementPatch<RectangleElement> {
    return { ...super.scale(el, t), cornerRadius: scaleLength(t, el.cornerRadius) };
  }

  override fillDefaults(el: RectangleElement): RectangleElement {
    return { ...super.fillDefaults(el), cornerRadius: el.cornerRadius ?? 0 };
  }
}
