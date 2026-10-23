import { create } from "zustand";

import type { EffectEditState } from "./effect-edit-store.types";

/**
 * Which effect's editor is open, shared by the Effects section and the handles drawn over the
 * canvas (app UI state).
 */
export const useEffectEditStore = create<EffectEditState>()((set) => ({
  editing: null,
  setEditing: (editing) => set({ editing }),
}));
