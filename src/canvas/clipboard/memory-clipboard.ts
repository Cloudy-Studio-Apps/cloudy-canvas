import type { Clipboard } from "@shared/core";

/** A clipboard that only lives in this engine, for hosts without a system clipboard. */
export class MemoryClipboard implements Clipboard {
  private text: string | null = null;
  private image: Blob | null = null;

  writeText(text: string): Promise<void> {
    this.text = text;
    return Promise.resolve();
  }

  readText(): Promise<string | null> {
    return Promise.resolve(this.text);
  }

  readImage(): Promise<Blob | null> {
    return Promise.resolve(this.image);
  }

  writeImage(png: Blob): Promise<void> {
    this.image = png;
    return Promise.resolve();
  }
}
