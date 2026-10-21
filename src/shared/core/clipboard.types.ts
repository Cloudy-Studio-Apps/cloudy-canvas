/**
 * The system clipboard, as plain text. Implemented per platform in `platform/` (desktop: Tauri's
 * clipboard manager; elsewhere: `navigator.clipboard`).
 */
export interface Clipboard {
  writeText(text: string): Promise<void>;
  /** The clipboard's text, or `null` when it holds none. */
  readText(): Promise<string | null>;
}
