import type { Graphics } from "pixi.js";

import { GeoVariant } from "./geo-variant";

export class Ellipse extends GeoVariant {
  readonly id = "ellipse";
  readonly label = "Ellipse";
  readonly defaultSize = { w: 120, h: 120 };

  outline(g: Graphics, w: number, h: number): void {
    g.ellipse(w / 2, h / 2, w / 2, h / 2);
  }
}
