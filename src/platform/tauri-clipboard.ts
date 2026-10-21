import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";

import type { Clipboard } from "@shared/core";

/** The system clipboard through Tauri's clipboard manager (the webview's own API is unreliable on Linux). */
export class TauriClipboard implements Clipboard {
  writeText(text: string): Promise<void> {
    return writeText(text);
  }

  async readText(): Promise<string | null> {
    try {
      return await readText();
    } catch {
      // Thrown when the clipboard holds no text (e.g. an image).
      return null;
    }
  }
}
