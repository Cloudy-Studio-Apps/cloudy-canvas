import { create } from "zustand";

import type { AboutState } from "./about-store.types";

/** Whether the About dialog is open. */
export const useAboutStore = create<AboutState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

/** Opens the About dialog from anywhere (menus, buttons, module items). */
export function openAbout(): void {
  useAboutStore.getState().setOpen(true);
}
