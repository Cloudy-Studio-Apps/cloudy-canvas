import type { ColorOptions } from "../../tokens";
import type { CanvasElement, ElementDefaults } from "@canvas";

/** A basic diagram shape with a centered label. */
export interface GeoElement extends CanvasElement {
  type: "geo";
  /** Id of the `GeoVariant` it's drawn with (rectangle, ellipse, …). */
  kind: string;
  fill: string;
  stroke: string;
  text: string;
  fontSize: number;
  /** Outline width; unset is `GEO_DEFAULTS.strokeWidth` (the Scale tool sets it). */
  strokeWidth?: number;
}

export interface GeoDefaults extends ElementDefaults {
  /** Its color fields and the tool options that pick them (field path → option). */
  colorOptions: ColorOptions;
  fontSize: number;
  /** Horizontal padding around the centered label. */
  padding: number;
  strokeWidth: number;
}
