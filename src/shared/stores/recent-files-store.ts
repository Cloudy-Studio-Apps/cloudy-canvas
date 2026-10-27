import { create } from "zustand";

import { openCanvasFileDialog, storage } from "@platform";
import { MOCK_RECENT_FILES } from "./mock-recent-files";
import type { RecentFilesState } from "./recent-files-store.types";
import { notifyError, toast } from "./toast-store";
import { t } from "./stores.i18n";

/** Dev-only preview of the populated Recent files grid. Enable with VITE_MOCK_RECENTS=true. */
const showMockRecents = import.meta.env.DEV && import.meta.env.VITE_MOCK_RECENTS === "true";

const NONE: ReadonlySet<string> = new Set();

export const useRecentFilesStore = create<RecentFilesState>()((set, get) => ({
  files: showMockRecents ? MOCK_RECENT_FILES : [],
  missing: NONE,
  refresh: async () => {
    if (showMockRecents) return;
    try {
      const files = await storage.list();
      if (storage.takeIndexReset()) {
        toast({
          title: t("recents.reset"),
          description: t("recents.resetHint"),
        });
      }
      const found = await Promise.all(files.map((file) => storage.exists(file.id)));
      const missing = new Set(files.filter((_, i) => !found[i]).map((file) => file.id));
      set({ files, missing: missing.size > 0 ? missing : NONE });
    } catch (error) {
      notifyError(t("recents.readFailed"), error);
    }
  },
  upsert: (file) =>
    set((state) => ({
      files: [file, ...state.files.filter((f) => f.id !== file.id)],
      missing: withoutId(state.missing, file.id),
    })),
  open: async (path) => {
    const file = await storage.register(path);
    get().upsert(file);
    return file;
  },
  relocate: async (id) => {
    try {
      const path = await openCanvasFileDialog();
      if (!path) return null;
      const file = await storage.relocate(id, path);
      get().upsert(file);
      return file;
    } catch (error) {
      notifyError(t("recents.locateFailed"), error);
      return null;
    }
  },
  forget: async (id) => {
    try {
      await storage.forget(id);
      set((state) => ({
        files: state.files.filter((f) => f.id !== id),
        missing: withoutId(state.missing, id),
      }));
    } catch (error) {
      notifyError(t("recents.removeFailed"), error);
    }
  },
  clear: async () => {
    try {
      await storage.clear();
      set({ files: [], missing: NONE });
    } catch (error) {
      notifyError(t("recents.clearFailed"), error);
    }
  },
}));

function withoutId(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (!ids.has(id)) return ids;
  const next = new Set(ids);
  next.delete(id);
  return next;
}
