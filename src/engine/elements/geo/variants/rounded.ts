import type { Graphics } from "pixi.js";

import { GeoVariant } from "./geo-variant";

/** Corner radius (kept tight, like the rest of the UI). */
const RADIUS = 12;

export class Rounded extends GeoVariant {
  readonly id = "rounded";
  readonly label = "Rounded rectangle";
  readonly defaultSize = { w: 160, h: 100 };

  outline(g: Graphics, w: number, h: number): void {
    g.roundRect(0, 0, w, h, Math.min(RADIUS, w / 2, h / 2));
  }
}
