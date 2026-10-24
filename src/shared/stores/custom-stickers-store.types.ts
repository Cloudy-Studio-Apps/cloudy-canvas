import type { StickerDef } from "@shared/core";

export interface CustomStickersState {
  /** The user's library as picker stickers (`custom:<id>`, shown from object URLs). */
  stickers: StickerDef[];
  loaded: boolean;
  /** Reads the library once. */
  load: () => Promise<void>;
  /** Asks for image files and adds them. */
  importFiles: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}
