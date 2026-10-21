import { BoxKind, type ElementDescription, type ElementView } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { drawSticker } from "./sticker.draw";
import { STICKER_DEFAULTS } from "./sticker.defaults";
import type { StickerDefaults, StickerElement } from "./sticker.types";

/**
 * A sticker stamped on the board: a "foca watona", a common stamp, an emoji or the user's own
 * picture. It keeps its proportions; agents may move and resize it, not create it.
 */
export class StickerKind extends BoxKind<StickerElement, BoardToolOptions> {
  readonly type = "sticker";
  readonly label = "Sticker";
  readonly description = "Stamp reactions: seals, emojis and your own stickers.";
  override readonly tool = "sticker";
  override readonly defaults: StickerDefaults = STICKER_DEFAULTS;
  override readonly creatable = false;
  override readonly keepsRatio = true;
  override readonly connectable = false;
  override readonly patchableFields: ReadonlySet<string> = new Set(["x", "y", "w", "h"]);

  draw(view: ElementView, el: StickerElement): void {
    drawSticker(view, el);
  }

  override assets(el: StickerElement): string[] {
    return [el.assetId];
  }

  override describe(el: StickerElement): ElementDescription {
    return { label: el.label, kind: el.sticker };
  }
}
