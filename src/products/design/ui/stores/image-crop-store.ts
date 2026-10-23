import { create } from "zustand";

import type { ImageCropState } from "./image-crop-store.types";

/**
 * Which image fill is being cropped on the canvas, shared by the paint picker, the Crop image
 * command and the crop overlay (app UI state).
 */
export const useImageCropStore = create<ImageCropState>()((set) => ({
  target: null,
  start: (target) =>
    set((state) =>
      state.target?.nodeId === target.nodeId && state.target.index === target.index
        ? state
        : { target },
    ),
  stop: () => set((state) => (state.target ? { target: null } : state)),
}));
