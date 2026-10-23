import { create } from "zustand";

import type { BoardImageCropState } from "./image-crop-store.types";

/** Which board image is being cropped (app UI state): double-click or the panel's Crop. */
export const useImageCropStore = create<BoardImageCropState>()((set) => ({
  id: null,
  start: (id) => set({ id }),
  stop: () => set((state) => (state.id ? { id: null } : state)),
}));
