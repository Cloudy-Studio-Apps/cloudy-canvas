import { create } from "zustand";

import type { ChromeState } from "./chrome-store.types";

/** Whether the open editor shows its UI around the canvas. Not kept: every editor opens with it. */
export const useChromeStore = create<ChromeState>()((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));
