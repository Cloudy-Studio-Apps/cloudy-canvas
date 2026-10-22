import { decodeCanvasFile, encodeCanvasFile } from "@canvas";

/** "CCDS": Cloudy Canvas DeSign. */
const MAGIC = "CCDS";

/** `.cdesign` bytes for a design's Yjs document update (see `encodeCanvasFile`). */
export function encodeDesignFile(update: Uint8Array): Uint8Array {
  return encodeCanvasFile(MAGIC, update);
}

/** Returns the Yjs update stored in a `.cdesign` file. Throws for other files or newer versions. */
export function decodeDesignFile(bytes: Uint8Array): Uint8Array {
  return decodeCanvasFile(MAGIC, bytes, "design");
}
