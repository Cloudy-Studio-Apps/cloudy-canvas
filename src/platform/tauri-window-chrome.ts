import { getCurrentWindow } from "@tauri-apps/api/window";

import { isApplePlatform, type WindowChrome } from "@shared/core";

/** The Tauri window's controls. The app draws them everywhere except macOS. */
export class TauriWindowChrome implements WindowChrome {
  readonly drawsControls = !isApplePlatform();

  minimize(): void {
    void getCurrentWindow().minimize();
  }

  toggleMaximize(): void {
    void getCurrentWindow().toggleMaximize();
  }

  close(): void {
    void getCurrentWindow().close();
  }

  setTitle(title: string): void {
    void getCurrentWindow().setTitle(title);
  }

  isMaximized(): Promise<boolean> {
    return getCurrentWindow().isMaximized();
  }

  onMaximizedChange(listener: (maximized: boolean) => void): () => void {
    let last: boolean | null = null;
    let disposed = false;
    let unlisten: (() => void) | null = null;
    void getCurrentWindow()
      .onResized(async () => {
        let maximized: boolean;
        try {
          maximized = await this.isMaximized();
        } catch {
          // The window may be going away; the next resize asks again.
          return;
        }
        if (disposed || maximized === last) return;
        last = maximized;
        listener(maximized);
      })
      .then((off) => {
        if (disposed) off();
        else unlisten = off;
      });
    return () => {
      disposed = true;
      unlisten?.();
    };
  }
}
