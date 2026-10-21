import { INK_COLOR, SHAPE_FILLS, SHAPE_STROKES } from "../../document/palette";
import type { ElementView } from "../../render/element-view";
import type { ToolOptions } from "../../tools/tool.types";
import { BoxKind } from "../bases/box-kind";
import type { ElementPatch } from "../element.types";
import type { ElementSpec, ElementText } from "../element-kind.types";
import { createGeo } from "./create-geo";
import { GEO_PADDING } from "./geo-defaults";
import { drawGeo } from "./draw-geo";
import type { GeoElement } from "./geo.types";
import { GEO_VARIANT_IDS, GEO_VARIANTS, isGeoVariantId } from "./variants/geo-variants";

/** Diagram shapes (rectangle, ellipse, …): the outline is delegated to the element's variant. */
export class GeoKind extends BoxKind<GeoElement> {
  readonly type = "geo";
  readonly label = "Shape";

  override readonly text: ElementText<GeoElement> = {
    ariaLabel: "Shape text",
    get: (el) => el.text,
    set: (el, text) => (text === el.text ? null : { text }),
    style: (el) => ({
      fontSize: el.fontSize,
      color: INK_COLOR,
      align: "center",
      vAlign: "middle",
      padX: GEO_PADDING,
      padY: 0,
    }),
  };

  draw(view: ElementView, el: GeoElement): void {
    drawGeo(view, el, this.text.style(el));
  }

  override build(spec: ElementSpec, index: string): GeoElement {
    const kind = spec.kind ?? "rectangle";
    if (!isGeoVariantId(kind)) {
      throw new Error(`"kind" must be one of: ${GEO_VARIANT_IDS.join(", ")}.`);
    }
    const size = GEO_VARIANTS[kind].defaultSize;
    const rect = { x: spec.x, y: spec.y, w: spec.w ?? size.w, h: spec.h ?? size.h };
    const fill = spec.fill ?? SHAPE_FILLS[0].value;
    const stroke = spec.stroke ?? SHAPE_STROKES[0].value;
    return { ...createGeo(rect, kind, fill, stroke, index), text: spec.text ?? "" };
  }

  /** An unknown variant (from a newer version or a bad patch) is drawn as a rectangle. */
  override fillDefaults(el: GeoElement): GeoElement {
    return isGeoVariantId(el.kind) ? el : { ...el, kind: "rectangle" };
  }

  override describe(el: GeoElement) {
    return { label: el.text, kind: el.kind };
  }

  override optionsOf(el: GeoElement): Partial<ToolOptions> {
    return { shapeKind: el.kind, shapeFill: el.fill, shapeStroke: el.stroke };
  }

  override restyle(_el: GeoElement, options: Partial<ToolOptions>): ElementPatch {
    const patch: ElementPatch = {};
    if (options.shapeKind) patch.kind = options.shapeKind;
    if (options.shapeFill) patch.fill = options.shapeFill;
    if (options.shapeStroke) patch.stroke = options.shapeStroke;
    return patch;
  }
}
