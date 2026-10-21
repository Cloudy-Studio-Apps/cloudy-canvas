import type { Graphics, StrokeStyle } from "pixi.js";

import type { Size } from "../../../geometry.types";
import type { GeoVariantId } from "../geo.types";

/** One outline a geo element can have (rectangle, ellipse, …). Registered in `geo-variants.ts`. */
export abstract class GeoVariant {
  abstract readonly id: GeoVariantId;
  abstract readonly label: string;
  /** Size of an element placed with a click. */
  abstract readonly defaultSize: Size;

  /** Adds the closed outline, in local coordinates (0,0 → w,h), to `g` for a fill or stroke. */
  abstract outline(g: Graphics, w: number, h: number): void;

  /** Extra lines drawn over the stroked outline, e.g. a cylinder's front edge. */
  decorate(_g: Graphics, _w: number, _h: number, _stroke: StrokeStyle): void {}
}

/** A variant whose outline is a polygon. */
export abstract class PolygonVariant extends GeoVariant {
  /** Flat [x0, y0, …] polygon in local coordinates. */
  protected abstract polygon(w: number, h: number): number[];

  outline(g: Graphics, w: number, h: number): void {
    g.poly(this.polygon(w, h));
  }
}
