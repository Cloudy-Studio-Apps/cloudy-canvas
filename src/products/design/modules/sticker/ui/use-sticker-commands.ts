import { useEffect } from "react";

import { stickerToVectors, type StickerNodeElement } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";

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
            title: "Nothing to convert",
            description: "Only stickers drawn as SVG can become vectors.",
          });
          return;
        }
        engine.select(groups);
      }),
    [engine],
  );
}
