import type { CanvasElement, ElementDefaults } from "@canvas";

/** What's drawn behind the image and its padding. */
export type ImageBackground = "none" | "white";

export interface ImageElement extends CanvasElement {
  type: "image";
  /** The document asset holding the image file. */
  assetId: string;
  background: ImageBackground;
  /** Space between the image and the element's bounds, in world units (the bounds include it). */
  padding: number;
}

export interface ImagePaddingOption {
  name: string;
  value: number;
}

export interface ImageDefaults extends ElementDefaults {
  background: ImageBackground;
  padding: number;
  /** The paddings the options panel offers. */
  paddings: readonly ImagePaddingOption[];
  /** A pasted image is shrunk to fit this share of the view (never enlarged). */
  fitInView: number;
}
