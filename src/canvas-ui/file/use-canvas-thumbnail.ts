import { useEffect } from "react";

import type { CanvasEngine } from "@canvas";
import { appLifecycle, storage } from "@platform";
import { useThumbnailStore } from "@shared/stores/thumbnail-store";

/** Size of the preview, in pixels: twice a Home card's preview, in its 16:10 proportion. */
const THUMBNAIL_SIZE = { width: 640, height: 400 };

/**
 * Takes a small picture of the canvas for the file's preview on Home when it's closed: when the
 * editor closes (going home, opening another file) and when the window closes.
 */
export function useCanvasThumbnail<O extends object>(id: string, engine: CanvasEngine<O>): void {
  useEffect(() => {
    const capture = async () => {
      try {
        const image = await engine.thumbnail(THUMBNAIL_SIZE);
        await storage.saveThumbnail(id, image && new Uint8Array(await image.arrayBuffer()));
        useThumbnailStore.getState().bump(id);
      } catch (error) {
        // Only the preview is missing; the file itself is saved separately.
        console.error("Couldn't save the preview picture.", error);
      }
    };
    engine.onClose("thumbnail", capture);
    return appLifecycle.onBeforeQuit(capture);
  }, [id, engine]);
}
