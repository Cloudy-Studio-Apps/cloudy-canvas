import { create } from "zustand";

import { storage } from "@platform";
import { MOCK_RECENT_FILES } from "./mock-recent-files";
import type { RecentFilesState } from "./recent-files-store.types";

/** Dev-only preview of the populated Recent files grid. Enable with VITE_MOCK_RECENTS=true. */
const showMockRecents = import.meta.env.DEV && import.meta.env.VITE_MOCK_RECENTS === "true";

export const useRecentFilesStore = create<RecentFilesState>()((set) => ({
  files: showMockRecents ? MOCK_RECENT_FILES : [],
  refresh: async () => {
    if (showMockRecents) return;
    try {
      set({ files: await storage.list() });
    } catch (error) {
      console.error("[recents] Failed to read recent files:", error);
    }
  },
  upsert: (file) =>
    set((state) => ({ files: [file, ...state.files.filter((f) => f.id !== file.id)] })),
}));
