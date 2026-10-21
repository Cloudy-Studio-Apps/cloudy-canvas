import { create } from "zustand";
import { MOCK_RECENT_FILES } from "./mock-recent-files";
import type { RecentFilesState } from "./recent-files-store.types";

/** Dev-only preview of the populated Recent files grid. Enable with VITE_MOCK_RECENTS=true. */
const showMockRecents = import.meta.env.DEV && import.meta.env.VITE_MOCK_RECENTS === "true";

// TODO: Populate from Storage.list() once real file loading exists.
export const useRecentFilesStore = create<RecentFilesState>()(() => ({
  files: showMockRecents ? MOCK_RECENT_FILES : [],
}));
