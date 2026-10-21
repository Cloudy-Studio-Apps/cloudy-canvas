import { create } from "zustand";

import type { UnsavedChangesState } from "./unsaved-changes-store.types";

/** Set by the open editor, so app-level actions (opening a dropped file) can warn before leaving it. */
export const useUnsavedChangesStore = create<UnsavedChangesState>()((set) => ({
  dirty: false,
  setDirty: (dirty) => set({ dirty }),
}));
