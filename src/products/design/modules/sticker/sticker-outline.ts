import type { NodeEffect } from "../core";
import type { StickerNodeElement } from "./sticker.types";

const NONE: readonly NodeEffect[] = [];
/** One outline per sticker as it is, so effect scopes see the same array while it doesn't change. */
const known = new WeakMap<StickerNodeElement, readonly NodeEffect[]>();

/**
 * A sticker's outline as an effect drawn under it: a shadow with no offset or blur, spread by the
 * outline's width, so it follows the picture's shape (an emoji's, a photo's cut-out) whatever it
 * is.
 */
export function stickerOutlineEffects(el: StickerNodeElement): readonly NodeEffect[] {
  const { outline } = el;
  if (!outline?.visible || outline.width <= 0) return NONE;
  let effects = known.get(el);
  if (!effects) {
    effects = [
      {
        id: `${el.id}:outline`,
        type: "drop-shadow",
        visible: true,
        color: outline.color,
        opacity: 1,
        x: 0,
        y: 0,
        blur: 0,
        spread: outline.width,
        showBehind: false,
      },
    ];
    known.set(el, effects);
  }
  return effects;
}
