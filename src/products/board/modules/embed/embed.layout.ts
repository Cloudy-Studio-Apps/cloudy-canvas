import type { Rect } from "@canvas";

import { EMBED_DEFAULTS } from "./embed.defaults";
import type { EmbedElement, EmbedLayout } from "./embed.types";

const { padding, footerHeight, previewRatio, buttonSize } = EMBED_DEFAULTS;

/** Whether the card shows a picture above its title: videos always, pages once they have one. */
export function hasPreview(el: Pick<EmbedElement, "provider" | "imageId">): boolean {
  return el.provider === "youtube" || el.imageId !== null;
}

/** The card's height for a width: the picture keeps its proportions, the footer its height. */
export function embedHeight(w: number, withPreview: boolean): number {
  return withPreview
    ? Math.round(padding + (w - padding * 2) * previewRatio + footerHeight)
    : footerHeight;
}

export function embedLayout(el: EmbedElement): EmbedLayout {
  const footer: Rect = { x: 0, y: el.h - footerHeight, w: el.w, h: footerHeight };
  const preview: Rect | null = hasPreview(el)
    ? { x: padding, y: padding, w: el.w - padding * 2, h: el.h - padding - footerHeight }
    : null;
  const play =
    preview && el.provider === "youtube"
      ? { x: preview.x + preview.w / 2, y: preview.y + preview.h / 2 }
      : null;
  const open: Rect = {
    x: el.w - 16 - buttonSize,
    y: footer.y + (footerHeight - buttonSize) / 2,
    w: buttonSize,
    h: buttonSize,
  };
  return { preview, play, footer, open };
}
