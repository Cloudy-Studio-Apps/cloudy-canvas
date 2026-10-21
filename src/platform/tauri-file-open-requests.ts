import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebview } from "@tauri-apps/api/webview";

import type { FileOpenRequests } from "@shared/core";

/** Files from the OS (`src-tauri/src/open_files.rs`) and files dropped on the webview. */
export class TauriFileOpenRequests implements FileOpenRequests {
  async launchPaths(): Promise<string[]> {
    if (!isTauri()) return [];
    return invoke<string[]>("launch_files");
  }

  onOpen(handler: (paths: string[]) => void): () => void {
    if (!isTauri()) return () => {};
    const forwarded = listen<string[]>("app://open-files", (event) => handler(event.payload));
    const dropped = getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type === "drop" && event.payload.paths.length > 0) {
        handler(event.payload.paths);
      }
    });
    return unlistenAll(forwarded, dropped);
  }

  onDragOver(handler: (over: boolean) => void): () => void {
    if (!isTauri()) return () => {};
    const unlisten = getCurrentWebview().onDragDropEvent((event) => {
      const { type } = event.payload;
      if (type === "enter") handler(event.payload.paths.length > 0);
      else if (type === "leave" || type === "drop") handler(false);
    });
    return unlistenAll(unlisten);
  }
}

/** Tauri's listeners resolve their unlisten functions later; this unlistens whenever they arrive. */
function unlistenAll(...pending: Promise<UnlistenFn>[]): () => void {
  return () => {
    for (const unlisten of pending) void unlisten.then((fn) => fn());
  };
}
