import { decodeCanvasFile, encodeCanvasFile } from "@canvas";

/** "CCBD": Cloudy Canvas BoarD. */
const MAGIC = "CCBD";

/** `.cboard` bytes for a board's Yjs document update (see `encodeCanvasFile`). */
export function encodeBoardFile(update: Uint8Array): Uint8Array {
  return encodeCanvasFile(MAGIC, update);
}

/** Returns the Yjs update stored in a `.cboard` file. Throws for other files or newer versions. */
export function decodeBoardFile(bytes: Uint8Array): Uint8Array {
  return decodeCanvasFile(MAGIC, bytes, "board");
}
