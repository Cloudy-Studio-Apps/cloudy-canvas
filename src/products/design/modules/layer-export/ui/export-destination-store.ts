import { create } from "zustand";

import type { ExportDestinationState } from "./export-destination-store.types";

/** Where several exported files go, the last choice (UI state only). */
export const useExportDestinationStore = create<ExportDestinationState>()((set) => ({
  destination: "folder",
  setDestination: (destination) => set({ destination }),
}));
