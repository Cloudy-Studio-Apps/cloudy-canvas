import { create } from "zustand";

import type { BoardPanelState } from "./board-panel-store.types";

/** Side panel UI state for the board editor (never canvas content). */
export const useBoardPanelStore = create<BoardPanelState>()((set) => ({
  schemaOpen: false,
  tableTab: "visual",
  erOpen: false,
  erTab: "visual",
  erDiagram: null,
  setSchemaOpen: (schemaOpen) => set(schemaOpen ? { schemaOpen, erOpen: false } : { schemaOpen }),
  setTableTab: (tableTab) => set({ tableTab }),
  setErOpen: (erOpen) => set(erOpen ? { erOpen, schemaOpen: false } : { erOpen }),
  setErTab: (erTab) => set({ erTab }),
  setErDiagram: (erDiagram) => set({ erDiagram }),
}));
