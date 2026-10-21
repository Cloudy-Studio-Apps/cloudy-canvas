import type { CanvasElement } from "../element.types";
import type { ElementDefaults } from "../element.kind.types";

/** A basic diagram shape with a centered label. */
export interface GeoElement extends CanvasElement {
  type: "geo";
  /** Id of the `GeoVariant` it's drawn with (rectangle, ellipse, …). */
  kind: string;
  fill: string;
  stroke: string;
  text: string;
  fontSize: number;
}

export interface GeoDefaults extends ElementDefaults {
  fontSize: number;
  /** Horizontal padding around the centered label. */
  padding: number;
  strokeWidth: number;
}
