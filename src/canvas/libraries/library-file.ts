import { decodeCanvasFile, encodeCanvasFile } from "../file";

/** "CLIB": Cloudy Canvas LIBrary. */
export const LIBRARY_MAGIC = "CLIB";

/** `.clib` bytes for a library's Yjs update (the same header as boards and designs). */
export function encodeLibraryFile(update: Uint8Array): Uint8Array {
  return encodeCanvasFile(LIBRARY_MAGIC, update);
}

/** The Yjs update stored in a `.clib` file. Throws for other files or newer versions. */
export function decodeLibraryFile(bytes: Uint8Array): Uint8Array {
  return decodeCanvasFile(LIBRARY_MAGIC, bytes, "library");
}
