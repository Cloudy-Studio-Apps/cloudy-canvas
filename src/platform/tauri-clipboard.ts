import { readImage, readText, writeText } from "@tauri-apps/plugin-clipboard-manager";

import type { Clipboard } from "@shared/core";
import { rgbaToPng } from "./rgba-to-png";

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

  async readImage(): Promise<Blob | null> {
    let image: Awaited<ReturnType<typeof readImage>>;
    try {
      image = await readImage();
    } catch {
      // Thrown when the clipboard holds no image.
      return null;
    }
    try {
      const { width, height } = await image.size();
      return await rgbaToPng(await image.rgba(), width, height);
    } finally {
      void image.close();
    }
  }
}
