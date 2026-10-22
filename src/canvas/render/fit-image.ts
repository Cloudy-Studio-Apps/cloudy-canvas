import { Rectangle, Texture, type Sprite } from "pixi.js";

import type { Rect } from "../geometry.types";
import type { ImageFit } from "./element-view.types";

/**
 * Shows `texture` on `sprite` in `box`, keeping its proportions: `contain` fits it inside,
 * centered; `cover` fills the box with the middle of the texture, cropped to the box's
 * proportions. Destroys `cropped` (the crop shown before, if any) and returns the new crop, which
 * the caller destroys in turn (`null` for `contain`).
 */
export function fitImage(
  sprite: Sprite,
  texture: Texture,
  box: Rect,
  fit: ImageFit,
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
  const scale = Math.max(w / texture.width, h / texture.height);
  const cropW = Math.min(texture.width, w / scale);
  const cropH = Math.min(texture.height, h / scale);
  const frame = new Rectangle(
    texture.frame.x + (texture.width - cropW) / 2,
    texture.frame.y + (texture.height - cropH) / 2,
    cropW,
    cropH,
  );
  const crop = new Texture({ source: texture.source, frame });
  sprite.texture = crop;
  cropped?.destroy(false);
  sprite.setSize(w, h);
  sprite.position.set(x, y);
  return crop;
}
