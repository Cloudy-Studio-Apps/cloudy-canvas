import type { KiwiRecord } from "../kiwi";

/** Which Figma product made a file: Figma Design (`.fig`) or FigJam (`.jam`). */
export type FigFileKind = "design" | "figjam";

/** What a `.fig` or `.jam` file holds once unpacked and decoded. */
export interface FigContainer {
  /** Which product the file is from, by its canvas prelude. */
  kind: FigFileKind;
  /** The prelude's format version (e.g. 106). */
  version: number;
  /** The decoded `Message`: `nodeChanges` (every node) and `blobs` (geometry). */
  message: KiwiRecord;
  /** Image files by their hash (hex), as image paints name them. */
  images: ReadonlyMap<string, Uint8Array>;
  /** The file's name from `meta.json`, when given. */
  name: string | null;
}
