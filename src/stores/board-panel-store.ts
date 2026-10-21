import { create } from "zustand";
import type { BoardPanelState } from "./board-panel-store.types";

/** Side panel UI state for the board editor (never canvas content). */
export const useBoardPanelStore = create<BoardPanelState>()((set) => ({
  schemaOpen: false,
  tableTab: "visual",
  setSchemaOpen: (schemaOpen) => set({ schemaOpen }),
  setTableTab: (tableTab) => set({ tableTab }),
}));
