import { useEffect } from "react";

import {
  heldLibraries,
  librariesUsedBy,
  libraryEditsOf,
  mirrorLibraries,
  type CanvasEngine,
  type LibraryDocument,
} from "@canvas";
import { notifyError } from "@shared/stores/toast-store";
import type { LibraryHub } from "./library-hub";
import { t } from "./libraries.i18n";

/**
 * Keeps an editor's file and its project's libraries in step while `hub` is open: mirrors the
 * libraries into the file now and whenever one changes or the file's link does, writes the user's
 * own edits to library records to the libraries, and mirrors again after a live session's guest
 * changed one (a guest's edits never reach the libraries; the library wins).
 */
export function useLibrarySync<O extends object>(
  engine: CanvasEngine<O>,
  hub: LibraryHub | null,
): void {
  useEffect(() => {
    if (!hub) return;
    const { doc } = engine;
    let closed = false;
    let running = false;
    let again = false;
    let pictureFailed = false;

    const used = (): string[] => {
      const link = doc.projectLink();
      return link ? librariesUsedBy(link, hub.entries(), heldLibraries(doc)) : [];
    };
    const readBytes = async (library: LibraryDocument, asset: { id: string }) => {
      try {
        return await hub.readAssetBytes(library.id, asset.id);
      } catch (error) {
        if (!pictureFailed) notifyError(t("hub.assetUnreadable"), error);
        pictureFailed = true;
        return null;
      }
    };
    const mirror = async (): Promise<void> => {
      if (closed) return;
      if (running) {
        again = true;
        return;
      }
      running = true;
      try {
        do {
          again = false;
          const ids = used();
          const libraries = ids.flatMap((id) => hub.library(id) ?? []);
          // Used but not loaded (unreadable, or read while the manifest is read again): kept.
          const keep = new Set(ids.filter((id) => !hub.library(id)));
          const usedAssets = libraries.some((library) => library.assets().length > 0)
            ? new Set(doc.all().flatMap((el) => engine.kinds.kindOf(el).assets(el)))
            : undefined;
          await mirrorLibraries(doc, libraries, readBytes, {
            keep,
            usedAssets,
            cancelled: () => closed,
          });
        } while (again && !closed);
      } catch (error) {
        notifyError(t("hub.syncFailed"), error);
      } finally {
        running = false;
      }
    };

    /** This editor's own edits, which the file has already: no mirror needed after them. */
    const self = {};
    void mirror();
    const offHub = hub.onChange((_ids, from) => {
      if (from !== self) void mirror();
    });
    const offLink = doc.observeProjectLink(() => void mirror());
    const offTokens = doc.observeTokens((ids, source) => {
      if (!source.local && !source.remote) return;
      const edits = libraryEditsOf(ids, source.previous, doc);
      if (edits.size === 0) return;
      if (source.remote) {
        queueMicrotask(() => void mirror());
        return;
      }
      // Only libraries the file uses now: this is what keeps taking a library out of the file
      // (`detachLibrary`, its records removed) from deleting them in the library, so the link
      // must stop listing it before the detach (and undo restores both together).
      const using = new Set(used());
      for (const id of edits.keys()) if (!using.has(id)) edits.delete(id);
      hub.apply(edits, self);
    });
    return () => {
      closed = true;
      offHub();
      offLink();
      offTokens();
    };
  }, [engine, hub]);
}
