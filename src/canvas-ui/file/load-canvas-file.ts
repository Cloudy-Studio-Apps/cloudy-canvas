import { CanvasDocument, type ShareGuest } from "@canvas";
import { storage } from "@platform";
import type { CanvasFileSource } from "./canvas-file.types";
import type { LoadedCanvasFile } from "./load-canvas-file.types";
import { t } from "./file.i18n";

/**
 * The document of the file with this id from storage, or an empty one when the id isn't a saved
 * file (one just created from Home), or a live session's (`live`: nothing is read from storage).
 * The caller owns the document and destroys it.
 */
export async function loadCanvasFile(
  id: string,
  source: CanvasFileSource,
  live: ShareGuest | null,
): Promise<LoadedCanvasFile> {
  const { noun, open, create, kinds } = source;
  try {
    if (live) return { document: new CanvasDocument(kinds, live.doc), info: null };
    const info = await storage.get(id);
    const document = info ? open(await storage.load(id)) : create();
    return { document, info };
  } catch (error) {
    console.error(`[${noun}] Failed to open the file:`, error);
    throw error instanceof Error ? error : new Error(t("errors.open", { noun }));
  }
}
