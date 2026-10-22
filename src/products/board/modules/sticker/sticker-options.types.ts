import type { PickedSticker } from "./sticker.types";

/** The sticker tool's options. */
export interface StickerToolOptions {
  /** What the sticker tool stamps; `null` until one is picked. */
  sticker: PickedSticker | null;
}
