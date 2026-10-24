import { create } from "zustand";

import type { BrochurePreviewState } from "./preview-store.types";

/** Whether the brochure's preview is open and which spread it shows. */
export const useBrochurePreviewStore = create<BrochurePreviewState>()((set) => ({
  spread: null,
  open: (spread = 0) => set({ spread }),
  show: (spread) => set({ spread }),
  close: () => set({ spread: null }),
}));
