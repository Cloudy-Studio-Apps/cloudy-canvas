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

  async readImage(): Promise<Blob | null> {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) return await item.getType(type);
      }
    } catch {
      // Denied, or not supported.
    }
    return null;
  }

  writeImage(png: Blob): Promise<void> {
    return navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
  }
}
