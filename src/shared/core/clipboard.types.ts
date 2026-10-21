/**
 * The system clipboard: plain text, and images to paste. Implemented per platform in `platform/`
 * (desktop: Tauri's clipboard manager; elsewhere: `navigator.clipboard`).
 */
export interface Clipboard {
  writeText(text: string): Promise<void>;
  /** The clipboard's text, or `null` when it holds none. */
  readText(): Promise<string | null>;
  /** The clipboard's image as an encoded file (e.g. PNG), or `null` when it holds none. */
  readImage(): Promise<Blob | null>;
  /** Puts a PNG file on the clipboard as an image. */
  writeImage(png: Blob): Promise<void>;
}
