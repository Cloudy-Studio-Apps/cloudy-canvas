import type { StickerImage } from "@shared/core";
import { pickImageFiles } from "./image-file";
import { t } from "./platform.i18n";

/** Asks for image files to import as stickers; empty when cancelled. */
export function importStickerFiles(): Promise<StickerImage[]> {
  return pickImageFiles({ title: t("importStickers"), multiple: true });
}
