import type { Graphics } from "pixi.js";

import { GeoVariant } from "./geo-variant";

export class Rectangle extends GeoVariant {
  readonly id = "rectangle";
  readonly label = "Rectangle";
  readonly defaultSize = { w: 160, h: 100 };

  outline(g: Graphics, w: number, h: number): void {
    g.rect(0, 0, w, h);
  }
}
