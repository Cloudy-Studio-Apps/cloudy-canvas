import { createElementBase, type Rect } from "@canvas";

import { IMAGE_DEFAULTS } from "./image.defaults";
import type { ImageElement } from "./image.types";

/** An image filling `rect`, with the default background and padding. */
export function createImage(assetId: string, rect: Rect, index: string): ImageElement {
  return {
    ...createElementBase("image", rect, index),
    assetId,
    background: IMAGE_DEFAULTS.background,
    padding: IMAGE_DEFAULTS.padding,
    crop: null,
  };
}
