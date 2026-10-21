import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { readFile } from "@tauri-apps/plugin-fs";

import { baseNameFromPath, type FileDrop, type FileOpenRequests } from "@shared/core";

/** Files from the OS (`src-tauri/src/open_files.rs`) and files dropped on the webview, read from disk. */
export class TauriFileOpenRequests implements FileOpenRequests {
  async launchPaths(): Promise<string[]> {
    if (!isTauri()) return [];
    return invoke<string[]>("launch_files");
  }

  onOpen(handler: (paths: string[]) => void): () => void {
    if (!isTauri()) return () => {};
    return unlistenAll(listen<string[]>("app://open-files", (event) => handler(event.payload)));
  }

  onDrop(handler: (drop: FileDrop) => void): () => void {
    if (!isTauri()) return () => {};
    const unlisten = getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type !== "drop" || event.payload.paths.length === 0) return;
      // Tauri reports the position in physical pixels of the webview.
      const at = event.payload.position.toLogical(window.devicePixelRatio);
      handler({
        files: event.payload.paths.map((path) => ({
          name: baseNameFromPath(path),
          path,
          read: () => readFile(path),
        })),
        at: { x: at.x, y: at.y },
      });
    });
    return unlistenAll(unlisten);
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
