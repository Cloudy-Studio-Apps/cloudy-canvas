import { useEffect } from "react";

import type { BoardEngine } from "@board";
import { appLifecycle, storage } from "@platform";
import { useThumbnailStore } from "@shared/stores/thumbnail-store";

/** Size of the preview, in pixels: twice a Home card's preview, in its 16:10 proportion. */
const THUMBNAIL_SIZE = { width: 640, height: 400 };

/**
 * Takes a small picture of the board for its preview on Home when the board is closed: when the
 * editor closes (going home, opening another file) and when the window closes.
 */
export function useBoardThumbnail(id: string, engine: BoardEngine): void {
  useEffect(() => {
    const capture = async () => {
      try {
        const image = await engine.thumbnail(THUMBNAIL_SIZE);
        await storage.saveThumbnail(id, image && new Uint8Array(await image.arrayBuffer()));
        useThumbnailStore.getState().bump(id);
      } catch (error) {
        // Only the preview is missing; the board itself is saved separately.
        console.error("[board] Couldn't save the preview picture.", error);
      }
    };
    engine.onClose("thumbnail", capture);
    return appLifecycle.onBeforeQuit(capture);
  }, [id, engine]);
}
