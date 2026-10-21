import { create } from "zustand";

import type { FileDropState } from "./file-drop-store.types";

/** Set by the open editor, so files dropped on the window (images, text) are added to its canvas. */
export const useFileDropStore = create<FileDropState>()((set) => ({
  target: null,
  setTarget: (target) => set({ target }),
}));
