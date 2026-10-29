import type { CanvasElement, DocumentMeta } from "@canvas";
import type { FontRequest, Locale } from "@shared/core";

/** A font face the file carries, for the text the board draws with it. */
export interface ViewerFont {
  request: FontRequest;
  /** The font file (TrueType, OpenType or WOFF), base64. */
  data: string;
}

/** A plugin whose code the file carries, because it draws in the viewer (`activateViewer`). */
export interface ViewerPlugin {
  id: string;
  name: string;
  /** Its `main.js`, run in the viewer from a `blob:` URL. */
  code: string;
  /** The element types it draws, shown as placeholders if it fails in the viewer. */
  types: string[];
}

/** What an exported HTML file carries: gzipped JSON, base64, in its `#cloudy-board` script. */
export interface ViewerFile {
  format: 1;
  appVersion: string;
  locale: Locale;
  meta: DocumentMeta;
  /** The board's elements, bottom to top. */
  elements: CanvasElement[];
  /** Asset id → base64 data URL. */
  assets: Record<string, string>;
  fonts: ViewerFont[];
  /** Part id → what its `collect` returned (parts that returned `null` are absent). */
  parts: Record<string, unknown>;
  plugins: ViewerPlugin[];
}
