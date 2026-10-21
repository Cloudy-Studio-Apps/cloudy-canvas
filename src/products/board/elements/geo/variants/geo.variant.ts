import type { Graphics, StrokeStyle } from "pixi.js";
import type { ElementSide, Point, Size } from "@canvas";

/**
 * One outline a geo element can have (rectangle, ellipse, …). Built-ins are registered in
 * `variant.registry.ts`; plugins can register more.
 */
export abstract class GeoVariant {
  /** Stored in the element's `kind`. */
  abstract readonly id: string;
  abstract readonly label: string;
  /** SVG path in a 20×20 box, drawn as an outline in the shape picker. */
  abstract readonly icon: string;
  /** Size of an element placed with a click. */
  abstract readonly defaultSize: Size;

  /** Adds the closed outline, in local coordinates (0,0 → w,h), to `g` for a fill or stroke. */
  abstract outline(g: Graphics, w: number, h: number): void;

  /** Extra lines drawn over the stroked outline, e.g. a cylinder's front edge. */
  decorate(_g: Graphics, _w: number, _h: number, _stroke: StrokeStyle): void {}

  /** Where a connector leaves the outline on each side, in local coordinates. */
  sideAnchor(w: number, h: number, side: ElementSide): Point {
    switch (side) {
      case "top":
        return { x: w / 2, y: 0 };
      case "right":
        return { x: w, y: h / 2 };
      case "bottom":
        return { x: w / 2, y: h };
      case "left":
        return { x: 0, y: h / 2 };
    }
  }
}

/** A variant whose outline is a polygon. */
export abstract class PolygonVariant extends GeoVariant {
  /** Flat [x0, y0, …] polygon in local coordinates. */
  protected abstract polygon(w: number, h: number): number[];

  outline(g: Graphics, w: number, h: number): void {
    g.poly(this.polygon(w, h));
  }
}
