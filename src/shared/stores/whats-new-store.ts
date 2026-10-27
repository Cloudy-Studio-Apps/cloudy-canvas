import { create } from "zustand";

import type { WhatsNewContent, WhatsNewState } from "./whats-new-store.types";

/** Whether the "What's new" dialog is open, and with what. */
export const useWhatsNewStore = create<WhatsNewState>()((set) => ({
  content: null,
  show: (content) => set({ content }),
  close: () => set({ content: null }),
}));

/** Opens the "What's new" dialog from anywhere (notices, About, Settings). */
export function openWhatsNew(content: WhatsNewContent): void {
  useWhatsNewStore.getState().show(content);
}
