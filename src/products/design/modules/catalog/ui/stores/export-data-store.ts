import { create } from "zustand";

import type { ExportDataState } from "./export-data-store.types";

/**
 * Whether a brochure export is asking how to read its data (`ExportDataPrompt` shows it): UI state
 * only, the sources' names and dates.
 */
export const useExportDataStore = create<ExportDataState>()((set, get) => ({
  question: null,
  ask: (sources) =>
    new Promise((resolve) => {
      get().question?.resolve(null);
      set({ question: { sources, resolve } });
    }),
  answer: (answer) => {
    const question = get().question;
    set({ question: null });
    question?.resolve(answer);
  },
}));
