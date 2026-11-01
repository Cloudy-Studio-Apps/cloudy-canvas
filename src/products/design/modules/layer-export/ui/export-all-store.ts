import { create } from "zustand";

import { createNodeExport } from "../node-exports";
import type { ExportAllState } from "./export-all.types";

/** Whether Export all is open, and its default row, kept for the session (UI state only). */
export const useExportAllStore = create<ExportAllState>()((set) => ({
  open: false,
  row: createNodeExport([]),
  setOpen: (open) => set({ open }),
  setRow: (row) => set({ row }),
}));
