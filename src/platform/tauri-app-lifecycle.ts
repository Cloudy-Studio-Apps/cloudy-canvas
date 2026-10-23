import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

import type { AppLifecycle } from "@shared/core";

/** How long closing the window waits for the tasks. */
const QUIT_TIMEOUT_MS = 5000;

/**
 * Runs the tasks when the window's close is requested. Tauri awaits the handler and then closes
 * the window, unless the handler prevents it.
 */
export class TauriAppLifecycle implements AppLifecycle {
  private readonly tasks = new Set<() => Promise<void>>();
  private listening = false;

  onBeforeQuit(task: () => Promise<void>): () => void {
    if (!isTauri()) return () => {};
    this.tasks.add(task);
    this.listen();
    return () => this.tasks.delete(task);
  }

  async runQuitTasks(): Promise<void> {
    const running = [...this.tasks].map((task) => task());
    const timeout = new Promise((resolve) => setTimeout(resolve, QUIT_TIMEOUT_MS));
    await Promise.race([Promise.allSettled(running), timeout]);
  }

  private listen(): void {
    if (this.listening) return;
    this.listening = true;
    void getCurrentWindow().onCloseRequested(() => this.runQuitTasks());
  }
}
