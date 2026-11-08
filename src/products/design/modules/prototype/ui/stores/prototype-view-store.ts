import { create } from "zustand";

import type { PrototypeViewState } from "./prototype-view-store.types";

/** What the Prototype mode shows and has picked (UI state only, never the prototype's content). */
export const usePrototypeViewStore = create<PrototypeViewState>()((set) => ({
  selectedFlow: null,
  selectFlow: (selectedFlow) => set({ selectedFlow }),
  showLinks: "all",
  setShowLinks: (showLinks) => set({ showLinks }),
}));
