import { create } from "zustand";

import type { GradientEditState } from "./gradient-edit-store.types";

/**
 * Which gradient the paint picker edits and its selected stop, shared by the picker and the
 * handles drawn over the canvas (app UI state).
 */
export const useGradientEditStore = create<GradientEditState>()((set) => ({
  target: null,
  stop: 0,
  setTarget: (target) =>
    set((state) => (sameTarget(state.target, target) ? state : { target, stop: 0 })),
  setStop: (stop) => set({ stop }),
}));

function sameTarget(a: GradientEditState["target"], b: GradientEditState["target"]): boolean {
  return a?.field === b?.field && a?.index === b?.index;
}
