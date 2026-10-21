import { BoxKind, ELEMENT_DEFAULTS, type ElementPatch, type ElementView, type Rect } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { drawImage } from "./image.draw";
import { IMAGE_DEFAULTS } from "./image.defaults";
import type { ImageDefaults, ImageElement } from "./image.types";

/**
 * A picture pasted onto the board. It keeps its proportions when resized; its background and
 * padding are picked in the options panel, and the padding grows the bounds around the image.
 */
export class ImageKind extends BoxKind<ImageElement, BoardToolOptions> {
  readonly type = "image";
  readonly label = "Image";
  readonly description = "A picture pasted onto the board.";
  override readonly defaults: ImageDefaults = IMAGE_DEFAULTS;
  override readonly creatable = false;
  override readonly keepsRatio = true;
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y", "w", "h"]);

  draw(view: ElementView, el: ImageElement): void {
    drawImage(view, el);
  }

  override assets(el: ImageElement): string[] {
    return [el.assetId];
  }

  override resize(el: ImageElement, rect: Rect): ElementPatch<ImageElement> {
    // The image itself never gets smaller than the minimum size.
    const min = ELEMENT_DEFAULTS.minSize + el.padding * 2;
    return { x: rect.x, y: rect.y, w: Math.max(min, rect.w), h: Math.max(min, rect.h) };
  }

  override fillDefaults(el: ImageElement): ImageElement {
    return {
      ...el,
      background: el.background ?? IMAGE_DEFAULTS.background,
      padding: el.padding ?? IMAGE_DEFAULTS.padding,
    };
  }

  override optionsOf(el: ImageElement): Partial<BoardToolOptions> {
    return { imageBackground: el.background, imagePadding: el.padding };
  }

  override restyle(
    el: ImageElement,
    options: Partial<BoardToolOptions>,
  ): ElementPatch<ImageElement> {
    const patch: ElementPatch<ImageElement> = {};
    if (options.imageBackground) patch.background = options.imageBackground;
    if (options.imagePadding !== undefined && options.imagePadding !== el.padding) {
      // The image stays where it is; the bounds grow or shrink around it.
      const d = options.imagePadding - el.padding;
      Object.assign(patch, {
        padding: options.imagePadding,
        x: el.x - d,
        y: el.y - d,
        w: el.w + d * 2,
        h: el.h + d * 2,
      });
    }
    return patch;
  }
}
