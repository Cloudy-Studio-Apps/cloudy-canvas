import {
  BoxKind,
  ELEMENT_DEFAULTS,
  scaleLength,
  scaleRect,
  type ElementPatch,
  type ElementStyle,
  type ElementView,
  type Rect,
  type ScaleTransform,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { drawImage } from "./image.draw";
import { IMAGE_DEFAULTS } from "./image.defaults";
import { checkCrop, imageCropPatch } from "./image-crop";
import { imagePaddingPatch } from "./image-padding";
import type { ImageDefaults, ImageElement } from "./image.types";
import { t } from "./image.i18n";

/**
 * A picture pasted onto the board. It keeps its proportions when resized; its background and
 * padding are picked in the options panel, and the padding grows the bounds around the image.
 * It can show part of the picture (`crop`, cropped on the canvas with a double-click).
 */
export class ImageKind extends BoxKind<ImageElement, BoardToolOptions> {
  readonly type = "image";
  readonly label = t("label");
  readonly description = t("description");
  override readonly defaults: ImageDefaults = IMAGE_DEFAULTS;
  override readonly styleFields = ["background", "padding"];
  override readonly creatable = false;
  override readonly keepsRatio = true;
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "x",
    "y",
    "w",
    "h",
    "background",
    "padding",
    "crop",
  ]);

  /** A pasted padding grows or shrinks the bounds round the picture. */
  override applyStyle(el: ImageElement, style: ElementStyle): ElementPatch<ImageElement> {
    const { padding, ...patch } = super.applyStyle(el, style);
    return padding === undefined ? patch : { ...patch, ...imagePaddingPatch(el, padding) };
  }

  draw(view: ElementView, el: ImageElement): void {
    drawImage(view, el);
  }

  override assets(el: ImageElement): string[] {
    return [el.assetId];
  }

  override assetScale(el: ImageElement): number {
    // A crop shows its part of the picture across the whole box.
    return el.crop ? 1 / Math.max(0.01, Math.min(el.crop.w, el.crop.h)) : 1;
  }

  override resize(el: ImageElement, rect: Rect): ElementPatch<ImageElement> {
    // The image itself never gets smaller than the minimum size.
    const min = ELEMENT_DEFAULTS.minSize + el.padding * 2;
    return { x: rect.x, y: rect.y, w: Math.max(min, rect.w), h: Math.max(min, rect.h) };
  }

  /** Scaled (the Scale tool), its padding grows with it. */
  override scale(el: ImageElement, t: ScaleTransform): ElementPatch<ImageElement> {
    const padding = scaleLength(t, el.padding);
    return { ...this.resize({ ...el, padding }, scaleRect(t, el)), padding };
  }

  override completePatch(
    el: ImageElement,
    patch: ElementPatch<ImageElement>,
  ): ElementPatch<ImageElement> {
    if (patch.crop !== undefined) {
      // The bounds follow the crop, round the part shown (unless given too).
      const cropped = imageCropPatch(el, checkCrop(patch.crop));
      const rest = { ...patch };
      delete rest.crop;
      return { ...cropped, ...this.completePatch({ ...el, ...cropped }, rest) };
    }
    const { backgrounds, maxPadding } = IMAGE_DEFAULTS;
    if (patch.background !== undefined && !backgrounds.includes(patch.background)) {
      throw new Error(`"background" must be one of: ${backgrounds.join(", ")}.`);
    }
    if (patch.padding === undefined) return patch;
    if (patch.padding < 0 || patch.padding > maxPadding) {
      throw new Error(`"padding" must be between 0 and ${maxPadding}.`);
    }
    // The padding grows the bounds as given (or as they are) around the image.
    return {
      ...patch,
      ...imagePaddingPatch({ ...el, ...patch, padding: el.padding }, patch.padding),
    };
  }

  override fillDefaults(el: ImageElement): ImageElement {
    return {
      ...el,
      background: el.background ?? IMAGE_DEFAULTS.background,
      padding: el.padding ?? IMAGE_DEFAULTS.padding,
      crop: el.crop ?? null,
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
      Object.assign(patch, imagePaddingPatch(el, options.imagePadding));
    }
    return patch;
  }
}
