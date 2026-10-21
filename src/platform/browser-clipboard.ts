import type { Clipboard } from "@shared/core";

/** The system clipboard through `navigator.clipboard` (browser dev, web). */
export class BrowserClipboard implements Clipboard {
  writeText(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  async readText(): Promise<string | null> {
    try {
      return await navigator.clipboard.readText();
    } catch {
      // Denied, or nothing readable.
      return null;
    }
  }
}
