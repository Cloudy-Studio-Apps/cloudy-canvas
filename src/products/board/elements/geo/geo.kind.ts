import type {
  ElementDescription,
  ElementPatch,
  ElementSide,
  ElementSpec,
  ElementTextStyle,
  ElementView,
  Point,
} from "@canvas";

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

  draw(view: ElementView, el: GeoElement): void {
    drawGeo(view, el, this.textStyle(el));
  }

  protected textStyle(el: GeoElement): ElementTextStyle {
    return {
      fontSize: el.fontSize,
      color: INK_COLOR,
      align: "center",
      vAlign: "middle",
      padX: GEO_DEFAULTS.padding,
      padY: 0,
    };
  }

  override build(spec: ElementSpec, index: string): GeoElement {
    const kind = spec.kind ?? "rectangle";
    const variant = geoVariants.get(kind);
    if (!variant) throw new Error(`"kind" must be one of: ${geoVariants.keys().join(", ")}.`);
    const rect = this.specRect(spec, variant.defaultSize);
    const fill = spec.fill ?? SHAPE_FILLS[0].value;
    const stroke = spec.stroke ?? SHAPE_STROKES[0].value;
    return { ...createGeo(rect, kind, fill, stroke, index), text: spec.text ?? "" };
  }

  override anchor(el: GeoElement, side: ElementSide): Point {
    const local = variantOf(el.kind).sideAnchor(el.w, el.h, side);
    return { x: el.x + local.x, y: el.y + local.y };
  }

  override describe(el: GeoElement): ElementDescription {
    return { ...super.describe(el), kind: el.kind };
  }

  override optionsOf(el: GeoElement): Partial<BoardToolOptions> {
    return { shapeKind: el.kind, shapeFill: el.fill, shapeStroke: el.stroke };
  }

  override restyle(_el: GeoElement, options: Partial<BoardToolOptions>): ElementPatch<GeoElement> {
    const patch: ElementPatch<GeoElement> = {};
    if (options.shapeKind) patch.kind = options.shapeKind;
    if (options.shapeFill) patch.fill = options.shapeFill;
    if (options.shapeStroke) patch.stroke = options.shapeStroke;
    return patch;
  }
}
