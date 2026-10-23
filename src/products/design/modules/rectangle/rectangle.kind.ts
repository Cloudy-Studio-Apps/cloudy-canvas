import {
  scaleLength,
  type ElementBuildContext,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type Rect,
  type ScaleTransform,
} from "@canvas";
import type { Graphics } from "pixi.js";

import type { DesignToolOptions } from "../../design-options.types";
import {
  BoxShapeKind,
  NODE_STYLE_FIELDS,
  nonNegative,
  rectNetwork,
  solidPaint,
  type NodeBuildContext,
  type VectorNetwork,
} from "../core";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import { drawRectangle, rectangleOutline } from "./rectangle.draw";
import { createRectangle } from "./rectangle.factory";
import type { RectangleElement } from "./rectangle.types";

export class RectangleKind extends BoxShapeKind<RectangleElement> {
  readonly type = "rectangle";
  readonly label = "Rectangle";
  readonly description = "A box with fills, strokes and rounded corners.";
  override readonly tool = "rectangle";
  override readonly defaults = RECTANGLE_DEFAULTS;
  override readonly styleFields = [...NODE_STYLE_FIELDS, "cornerRadius"];
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

  override fillOutline(el: RectangleElement): (g: Graphics) => void {
    return rectangleOutline(el);
  }

  draw(view: ElementView, el: RectangleElement): void {
    drawRectangle(view, el);
  }

  /** Its corners round in proportion. */
  override scale(el: RectangleElement, t: ScaleTransform): ElementPatch<RectangleElement> {
    return { ...super.scale(el, t), cornerRadius: scaleLength(t, el.cornerRadius) };
  }

  override fillDefaults(el: RectangleElement): RectangleElement {
    return { ...super.fillDefaults(el), cornerRadius: el.cornerRadius ?? 0 };
  }
}
