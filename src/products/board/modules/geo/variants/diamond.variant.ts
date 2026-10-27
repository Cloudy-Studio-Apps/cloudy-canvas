import { PolygonVariant } from "./geo.variant";
import { t } from "../geo.i18n";

export class Diamond extends PolygonVariant {
  readonly id = "diamond";
  readonly label = t("variants.diamond");
  readonly icon = "M10 2.5l7.5 7.5L10 17.5L2.5 10z";
  readonly defaultSize = { w: 140, h: 120 };

  protected polygon(w: number, h: number): number[] {
    return [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2];
  }
}
