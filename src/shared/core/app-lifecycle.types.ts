/** The app's window closing. Implemented per platform in `platform/`. */
export interface AppLifecycle {
  /**
   * Runs `task` when the window is closing; the window waits for it (a few seconds at most), so
   * pending saves can finish. Returns an unsubscribe function.
   */
  onBeforeQuit(task: () => Promise<void>): () => void;
}
