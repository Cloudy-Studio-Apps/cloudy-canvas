import type { ElementSide, Point } from "@canvas";

import { PolygonVariant } from "./geo.variant";
import { t } from "../geo.i18n";

export class Triangle extends PolygonVariant {
  readonly id = "triangle";
  readonly label = t("variants.triangle");
  readonly icon = "M10 3l7.5 13.5h-15z";
  readonly defaultSize = { w: 130, h: 120 };

  protected polygon(w: number, h: number): number[] {
    return [w / 2, 0, w, h, 0, h];
  }

  override sideAnchor(w: number, h: number, side: ElementSide): Point {
    if (side === "left") return { x: w / 4, y: h / 2 };
    if (side === "right") return { x: (3 * w) / 4, y: h / 2 };
    return super.sideAnchor(w, h, side);
  }
}
