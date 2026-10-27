import type { Graphics } from "pixi.js";

import { GeoVariant } from "./geo.variant";
import { t } from "../geo.i18n";

/** Corner radius (kept tight, like the rest of the UI). */
const RADIUS = 12;

export class Rounded extends GeoVariant {
  readonly id = "rounded";
  readonly label = t("variants.rounded");
  readonly icon = "M5 5h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z";
  readonly defaultSize = { w: 160, h: 100 };

  outline(g: Graphics, w: number, h: number): void {
    g.roundRect(0, 0, w, h, Math.min(RADIUS, w / 2, h / 2));
  }
}
