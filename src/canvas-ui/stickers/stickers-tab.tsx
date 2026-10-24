import { StickerGrid } from "./sticker-grid";
import type { StickerTabProps } from "./sticker-picker.types";
import { useStickerSections } from "./use-sticker-sections";

/** The "foca watona" stickers, the common stamps and the groups plugins add. */
export function StickersTab(props: StickerTabProps) {
  const sections = useStickerSections("stickers");
  return <StickerGrid sections={sections} {...props} />;
}
