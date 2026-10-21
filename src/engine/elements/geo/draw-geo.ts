import { TRANSPARENT } from "../../document/palette";
import type { ElementView } from "../../render/element-view";
import type { ElementTextStyle } from "../element-kind.types";
import { GEO_STROKE_WIDTH } from "./geo-defaults";
import type { GeoElement } from "./geo.types";
import { GEO_VARIANTS } from "./variants/geo-variants";

/** Fill, outline and the centered, wrapped label. The outline comes from the element's variant. */
export function drawGeo(view: ElementView, el: GeoElement, textStyle: ElementTextStyle): void {
  const { w, h, fill, stroke } = el;
  const variant = GEO_VARIANTS[el.kind];
  const g = view.graphics.clear();

  if (fill !== TRANSPARENT) {
    variant.outline(g, w, h);
    g.fill({ color: fill });
  }
  if (stroke !== TRANSPARENT) {
    const style = {
      color: stroke,
      width: GEO_STROKE_WIDTH,
      alignment: 0.5,
      join: "round",
    } as const;
    variant.outline(g, w, h);
    g.stroke(style);
    variant.decorate(g, w, h, style);
  }

  view.placeText(el.text, textStyle, w, h);
}
