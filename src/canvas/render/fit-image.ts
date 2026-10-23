import { Rectangle, Texture, type Sprite } from "pixi.js";

import type { Rect } from "../geometry.types";
import { clampCrop, coverCrop, type ImageCrop } from "../image";
import type { ImageFit } from "./element-view.types";

/**
 * Shows `texture` on `sprite` in `box`: `contain` fits it inside, centered, keeping its
 * proportions; `cover` fills the box with the middle of the texture, cropped to the box's
 * proportions; an `ImageCrop` fills the box with that part of the picture (kept inside it).
 * Destroys `cropped` (the crop shown before, if any) and returns the new crop, which the caller
 * destroys in turn (`null` for `contain`).
 */
export function fitImage(
  sprite: Sprite,
  texture: Texture,
  box: Rect,
  fit: ImageFit | ImageCrop,
  cropped: Texture | null,
): Texture | null {
  const { x, y, w, h } = box;
  sprite.visible = true;
  if (fit === "contain") {
    const scale = Math.min(w / texture.width, h / texture.height);
    sprite.texture = texture;
    cropped?.destroy(false);
    sprite.setSize(texture.width * scale, texture.height * scale);
    sprite.position.set(x + (w - sprite.width) / 2, y + (h - sprite.height) / 2);
    return null;
  }
  const part =
    fit === "cover" ? coverCrop(box, { w: texture.width, h: texture.height }) : clampCrop(fit);
  const frame = new Rectangle(
    texture.frame.x + part.x * texture.width,
    texture.frame.y + part.y * texture.height,
    Math.max(1, part.w * texture.width),
    Math.max(1, part.h * texture.height),
  );
  const crop = new Texture({ source: texture.source, frame });
  sprite.texture = crop;
  cropped?.destroy(false);
  sprite.setSize(w, h);
  sprite.position.set(x, y);
  return crop;
}
