import type { KiwiRecord } from "../kiwi";

/** What a `.fig` file holds once unpacked and decoded. */
export interface FigContainer {
  /** The prelude's format version (e.g. 106). */
  version: number;
  /** The decoded `Message`: `nodeChanges` (every node) and `blobs` (geometry). */
  message: KiwiRecord;
  /** Image files by their hash (hex), as image paints name them. */
  images: ReadonlyMap<string, Uint8Array>;
  /** The file's name from `meta.json`, when given. */
  name: string | null;
}
