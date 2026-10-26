import { create } from "zustand";

import type { BoardPanelState } from "./board-panel-store.types";

/** Side panel UI state for the board editor (never canvas content). */
export const useBoardPanelStore = create<BoardPanelState>()((set) => ({
  schemaOpen: false,
  tableTab: "visual",
  erOpen: false,
  erTab: "visual",
  erDiagram: null,
  erCollapsed: false,
  libraryOpen: false,
  colorsOpen: false,
  setSchemaOpen: (schemaOpen) =>
    set(schemaOpen ? { schemaOpen, erOpen: false, colorsOpen: false } : { schemaOpen }),
  setTableTab: (tableTab) => set({ tableTab }),
  setErOpen: (erOpen) =>
    set(erOpen ? { erOpen, schemaOpen: false, colorsOpen: false } : { erOpen }),
  setErTab: (erTab) => set({ erTab }),
  setErDiagram: (erDiagram) => set({ erDiagram }),
  setErCollapsed: (erCollapsed) => set({ erCollapsed }),
  setLibraryOpen: (libraryOpen) => set({ libraryOpen }),
  setColorsOpen: (colorsOpen) =>
    set(colorsOpen ? { colorsOpen, schemaOpen: false, erOpen: false } : { colorsOpen }),
}));
