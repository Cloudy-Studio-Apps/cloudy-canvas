import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { AppLinks } from "@shared/core";

/** `cloudy-canvas://` links from the OS (`src-tauri/src/app_links.rs`). */
export class TauriAppLinks implements AppLinks {
  async launchLinks(): Promise<string[]> {
    if (!isTauri()) return [];
    return invoke<string[]>("launch_links");
  }

  onOpen(handler: (links: string[]) => void): () => void {
    if (!isTauri()) return () => {};
    const unlisten = listen<string[]>("app://open-links", (event) => handler(event.payload));
    return () => void unlisten.then((fn) => fn());
  }
}
