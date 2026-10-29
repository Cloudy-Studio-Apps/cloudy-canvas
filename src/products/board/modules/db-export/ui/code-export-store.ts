import { create } from "zustand";

import type { CodeExportState } from "./code-export-store.types";

/** Which tables the Export code dialog is open for, and the last choice (UI state only). */
export const useCodeExportStore = create<CodeExportState>()((set) => ({
  ids: null,
  open: (ids) => set({ ids }),
  close: () => set({ ids: null }),
  last: null,
  remember: (last) => set({ last }),
}));
