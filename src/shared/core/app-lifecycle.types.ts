/** The app's window closing. Implemented per platform in `platform/`. */
export interface AppLifecycle {
  /**
   * Asks `confirm` first when the user closes the window (e.g. the open editor's close dialog);
   * `false` keeps the window open. The last one set asks. Returns an unsubscribe function.
   */
  onCloseRequest(confirm: () => Promise<boolean>): () => void;
  /**
   * Runs `task` when the window is closing; the window waits for it (a few seconds at most), so
   * pending saves can finish. Returns an unsubscribe function.
   */
  onBeforeQuit(task: () => Promise<void>): () => void;
  /**
   * Runs the `onBeforeQuit` tasks now (a few seconds at most), for when the app is about to close
   * on its own, e.g. to install an update. It doesn't ask.
   */
  runQuitTasks(): Promise<void>;
}
