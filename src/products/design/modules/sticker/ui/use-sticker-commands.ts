import { useEffect } from "react";

import { stickerToVectors } from "../sticker-to-vectors";
import type { StickerNodeElement } from "../sticker.types";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";
import { t } from "../sticker.i18n";

/** Runs Convert to vectors on the selected stickers, as one undo step. */
export function useStickerCommands(): void {
  const engine = useDesignEngine();
  useEffect(
    () =>
      engine.handleHostAction("stickerToVectors", () => {
        const stickers = engine
          .elements()
          .filter(
            (el): el is StickerNodeElement =>
              el.type === "sticker" && engine.selectedIds().includes(el.id),
          );
        if (stickers.length === 0) return;
        engine.doc.checkpoint();
        const groups = stickers.flatMap((sticker) => stickerToVectors(engine.doc, sticker) ?? []);
        if (groups.length === 0) {
          toast({
            title: t("toasts.nothingTitle"),
            description: t("toasts.nothingBody"),
          });
          return;
        }
        engine.select(groups);
      }),
    [engine],
  );
}
