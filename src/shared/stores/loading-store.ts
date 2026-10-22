import { create } from "zustand";

import type { LoadingState, ReportLoading } from "./loading-store.types";

/** The task the global loading screen shows, if any. Holds no task content, only its progress. */
export const useLoadingStore = create<LoadingState>()((set) => ({
  task: null,
  set: (task) => set({ task }),
}));

/**
 * Covers the window with the loading screen while `task` runs, and resolves to its result. The
 * task tells the screen what it's doing through `report`; the screen goes away however it ends.
 */
export async function runWithLoading<T>(
  title: string,
  task: (report: ReportLoading) => Promise<T>,
): Promise<T> {
  const { set } = useLoadingStore.getState();
  const report: ReportLoading = (stage, progress = null) => set({ title, stage, progress });
  report("Starting");
  try {
    return await task(report);
  } finally {
    set(null);
  }
}
