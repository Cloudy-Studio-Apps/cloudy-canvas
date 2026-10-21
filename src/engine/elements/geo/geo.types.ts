import type { CanvasElement } from "../element.types";

/** The outline a geo element is drawn with. Each one is a `GeoVariant` in `variants/`. */
export type GeoVariantId =
  | "rectangle"
  | "rounded"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "parallelogram"
  | "cylinder"
  | "star";

/** A basic diagram shape with a centered label. */
export interface GeoElement extends CanvasElement {
  type: "geo";
  kind: GeoVariantId;
  fill: string;
  stroke: string;
  text: string;
  fontSize: number;
}
