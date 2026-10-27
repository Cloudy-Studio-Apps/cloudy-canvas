import { Loader2 } from "lucide-react";

import { StickerGrid } from "./sticker-grid";
import type { StickerTabProps } from "./sticker-picker.types";
import { useEmojiSections } from "./use-emoji-sections";
import { t } from "./stickers.i18n";

/** Every emoji, grouped as in the Unicode list (loaded when the tab opens). */
export function EmojiTab(props: StickerTabProps) {
  const sections = useEmojiSections();
  if (!sections) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-label={t("loadingEmojis")} />
      </div>
    );
  }
  return <StickerGrid sections={sections} {...props} />;
}
