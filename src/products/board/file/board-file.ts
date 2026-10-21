import { CURRENT_FORMAT_VERSION } from "@shared/core";

/** "CCBD": Cloudy Canvas BoarD. */
const MAGIC = [0x43, 0x43, 0x42, 0x44] as const;
const HEADER_SIZE = 8;

/**
 * `.cboard` layout: 4-byte magic, u32 little-endian format version, then the board's Yjs document
 * update (every element).
 */
export function encodeBoardFile(update: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(HEADER_SIZE + update.length);
  bytes.set(MAGIC, 0);
  new DataView(bytes.buffer).setUint32(4, CURRENT_FORMAT_VERSION, true);
  bytes.set(update, HEADER_SIZE);
  return bytes;
}

/** Returns the Yjs update stored in a `.cboard` file. Throws for other files or newer versions. */
export function decodeBoardFile(bytes: Uint8Array): Uint8Array {
  if (bytes.length < HEADER_SIZE || MAGIC.some((byte, i) => bytes[i] !== byte)) {
    throw new Error("This isn't a Cloudy Canvas board file.");
  }
  const version = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true);
  if (version > CURRENT_FORMAT_VERSION) {
    throw new Error(
      "This board was saved by a newer version of Cloudy Canvas. Update the app to open it.",
    );
  }
  return bytes.subarray(HEADER_SIZE);
}
