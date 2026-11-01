import { create } from "zustand";

import type { ExportTokensState } from "./exchange.types";

/** Whether the export dialog is open (UI state only). */
export const useExportTokensStore = create<ExportTokensState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

/** Opens the export dialog, from anywhere in the design editor. */
export function openExportTokens(): void {
  useExportTokensStore.getState().setOpen(true);
}
