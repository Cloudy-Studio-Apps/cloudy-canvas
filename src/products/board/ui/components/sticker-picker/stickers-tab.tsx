import { STICKER_SECTIONS } from "@board";
import { StickerGrid } from "./sticker-grid";
import type { StickerTabProps } from "./sticker-picker.types";

/** The "foca watona" stickers and the common stamps. */
export function StickersTab(props: StickerTabProps) {
  return <StickerGrid sections={STICKER_SECTIONS} {...props} />;
}
