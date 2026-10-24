import type { DesignNode, ImagePaint } from "../../core";

/** A picture on a page: a layer's image fill. */
export interface PagePicture {
  node: DesignNode;
  /** The fill's index among the layer's fills. */
  fill: number;
  paint: ImagePaint;
}
