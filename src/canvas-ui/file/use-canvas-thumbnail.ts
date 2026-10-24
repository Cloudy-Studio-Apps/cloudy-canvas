import { useCallback, useEffect, useRef } from "react";

import type { CanvasEngine } from "@canvas";
import { appLifecycle, storage } from "@platform";
import { useThumbnailStore } from "@shared/stores/thumbnail-store";
import type { SaveKind } from "./canvas-file.types";

/** Size of the preview, in pixels: twice a Home card's preview, in its 16:10 proportion. */
const THUMBNAIL_SIZE = { width: 640, height: 400 };

/**
 * Takes a small picture of the canvas for the file's preview on Home, drawn from what's on screen
 * (about a frame), only when the document changed since the last one: after a manual save
 * (`saved`), when the editor closes (going home, opening another file) and when the window
 * closes. The returned `capture` takes one now; the close dialog calls it when it opens.
 */
export function useCanvasThumbnail<O extends object>(
  id: string,
  engine: CanvasEngine<O>,
  saved: SaveKind | null,
): () => Promise<void> {
  /** Starts true, so a file opened and closed gets a picture of how it looks today. */
  const changed = useRef(true);

  useEffect(
    () =>
      engine.doc.onChange(() => {
        changed.current = true;
      }),
    [engine],
  );

  const capture = useCallback(async () => {
    if (!changed.current) return;
    changed.current = false;
    try {
      const image = await engine.thumbnail(THUMBNAIL_SIZE);
      await storage.saveThumbnail(id, image && new Uint8Array(await image.arrayBuffer()));
      useThumbnailStore.getState().bump(id);
    } catch (error) {
      // Only the preview is missing; the file itself is saved separately.
      changed.current = true;
      console.error("Couldn't save the preview picture.", error);
    }
  }, [id, engine]);

  useEffect(() => {
    engine.onClose("thumbnail", capture);
    return appLifecycle.onBeforeQuit(capture);
  }, [engine, capture]);

  useEffect(() => {
    if (saved === "manual") void capture();
  }, [saved, capture]);

  return capture;
}
