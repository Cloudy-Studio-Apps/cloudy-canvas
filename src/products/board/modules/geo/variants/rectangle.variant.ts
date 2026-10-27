import type { Graphics } from "pixi.js";

import { GeoVariant } from "./geo.variant";
import { t } from "../geo.i18n";

export class Rectangle extends GeoVariant {
  readonly id = "rectangle";
  readonly label = t("variants.rectangle");
  readonly icon = "M3 5h14v10H3z";
  readonly defaultSize = { w: 160, h: 100 };

  outline(g: Graphics, w: number, h: number): void {
    g.rect(0, 0, w, h);
  }
}
