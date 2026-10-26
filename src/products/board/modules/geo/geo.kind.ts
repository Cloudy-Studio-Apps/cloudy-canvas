import {
  scaleLength,
  scaleRect,
  type ElementDescription,
  type ElementPatch,
  type ElementSide,
  type ElementSpec,
  type ElementTextStyle,
  type ElementView,
  type Point,
  type ScaleTransform,
  type BindableField,
} from "@canvas";

import { colorField, colorTokenOptions, restyleColors } from "../../tokens";
import { INK_COLOR, SHAPE_FILLS, SHAPE_STROKES } from "../../palette";
import type { BoardToolOptions } from "../../board-options.types";
import { QuickConnectKind } from "../connector/quick-connect.kind";
import { createGeo } from "./geo.factory";
import { GEO_DEFAULTS } from "./geo.defaults";
import { drawGeo } from "./geo.draw";
import type { GeoElement } from "./geo.types";
import { geoVariants, variantOf } from "./variants/variant.registry";

/** Diagram shapes (rectangle, ellipse, …): the outline is delegated to the element's variant. */
export class GeoKind extends QuickConnectKind<GeoElement> {
  readonly type = "geo";
  readonly label = "Shape";
  readonly description = "A rectangle, ellipse, diamond or other diagram shape, with a label.";
  override readonly tool = "shape";
  override readonly defaults = GEO_DEFAULTS;
  override readonly styleFields = ["fill", "stroke", "strokeWidth", "fontSize"];
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "x",
    "y",
    "w",
    "h",
    "text",
    "kind",
    "fill",
    "stroke",
  ]);

  draw(view: ElementView, el: GeoElement): void {
    drawGeo(view, el, this.textStyle(el));
  }

  protected textStyle(el: GeoElement): ElementTextStyle {
    return {
      fontSize: el.fontSize,
      color: INK_COLOR,
      align: "center",
      vAlign: "middle",
      // The padding follows the label's size (the Scale tool grows both).
      padX: (GEO_DEFAULTS.padding * el.fontSize) / GEO_DEFAULTS.fontSize,
      padY: 0,
    };
  }

  /** Scaled (the Scale tool), its label and outline grow with it. */
  override scale(el: GeoElement, t: ScaleTransform): ElementPatch<GeoElement> {
    return {
      ...this.resize(el, scaleRect(t, el)),
      fontSize: scaleLength(t, el.fontSize),
      strokeWidth: scaleLength(t, el.strokeWidth ?? GEO_DEFAULTS.strokeWidth),
    };
  }

  override build(spec: ElementSpec, index: string): GeoElement {
    const kind = spec.kind ?? "rectangle";
    const variant = requireVariant(kind);
    const rect = this.specRect(spec, variant.defaultSize);
    const fill = spec.fill ?? SHAPE_FILLS[0].value;
    const stroke = spec.stroke ?? SHAPE_STROKES[0].value;
    return { ...createGeo(rect, kind, fill, stroke, index), text: spec.text ?? "" };
  }

  override completePatch(
    _el: GeoElement,
    patch: ElementPatch<GeoElement>,
  ): ElementPatch<GeoElement> {
    if (patch.kind !== undefined) requireVariant(patch.kind);
    return patch;
  }

  override anchor(el: GeoElement, side: ElementSide): Point {
    const local = variantOf(el.kind).sideAnchor(el.w, el.h, side);
    return { x: el.x + local.x, y: el.y + local.y };
  }

  /** Its fill and outline bind to color variables. */
  override bindable(): BindableField[] {
    return [
      colorField("fill", "Fill", "shape-fill"),
      colorField("stroke", "Outline", "stroke-color"),
    ];
  }

  override describe(el: GeoElement): ElementDescription {
    return { ...super.describe(el), kind: el.kind };
  }

  override optionsOf(el: GeoElement): Partial<BoardToolOptions> {
    return {
      shapeKind: el.kind,
      shapeFill: el.fill,
      shapeStroke: el.stroke,
      ...colorTokenOptions(el, GEO_DEFAULTS.colorOptions),
    };
  }

  override restyle(el: GeoElement, options: Partial<BoardToolOptions>): ElementPatch<GeoElement> {
    const patch: ElementPatch<GeoElement> = restyleColors(el, options, GEO_DEFAULTS.colorOptions);
    if (options.shapeKind) patch.kind = options.shapeKind;
    return patch;
  }
}

function requireVariant(kind: string) {
  const variant = geoVariants.get(kind);
  if (!variant) throw new Error(`"kind" must be one of: ${geoVariants.keys().join(", ")}.`);
  return variant;
}
