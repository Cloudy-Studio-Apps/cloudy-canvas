import { create } from "zustand";

import type { ErToTablesState } from "./er-to-tables.types";

/** Which diagram the "Create tables" dialog is open for (UI state only). */
export const useErToTablesStore = create<ErToTablesState>()((set) => ({
  diagramId: null,
  open: (diagramId) => set({ diagramId }),
  close: () => set({ diagramId: null }),
}));
