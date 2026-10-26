import { create } from "zustand";

import type { StyleguideViewState } from "./styleguide-view-store.types";

/** The Design system view's UI state: the category or group the sidebar shows (session only). */
export const useStyleguideViewStore = create<StyleguideViewState>((set) => ({
  selected: null,
  select: (selected) => set({ selected }),
}));
