import type { StickerImage } from "@shared/core";
import { pickImageFiles } from "./image-file";

/** Asks for image files to import as stickers; empty when cancelled. */
export function importStickerFiles(): Promise<StickerImage[]> {
  return pickImageFiles({ title: "Import stickers", multiple: true });
}
