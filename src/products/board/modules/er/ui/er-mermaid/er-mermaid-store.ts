import { create } from "zustand";

import type { ErMermaidState } from "./er-mermaid.types";

/** Which diagram the Mermaid dialog is open for (UI state only). */
export const useErMermaidStore = create<ErMermaidState>()((set) => ({
  diagramId: null,
  open: (diagramId) => set({ diagramId }),
  close: () => set({ diagramId: null }),
}));
