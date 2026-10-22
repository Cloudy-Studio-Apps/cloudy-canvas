import { CURRENT_FORMAT_VERSION } from "@shared/core";

const HEADER_SIZE = 8;

/** The 4 bytes a product's files start with (e.g. "CCBD" for boards). */
function magicBytes(magic: string): number[] {
  if (magic.length !== 4) throw new Error(`A file magic has 4 characters, not "${magic}".`);
  return [...magic].map((char) => char.charCodeAt(0));
}

/**
 * A canvas file: 4-byte `magic` (the product's), u32 little-endian format version, then the
 * document's Yjs update (every element).
 */
export function encodeCanvasFile(magic: string, update: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(HEADER_SIZE + update.length);
  bytes.set(magicBytes(magic), 0);
  new DataView(bytes.buffer).setUint32(4, CURRENT_FORMAT_VERSION, true);
  bytes.set(update, HEADER_SIZE);
  return bytes;
}

/**
 * The Yjs update stored in a canvas file. Throws for files of another product (named `noun`, e.g.
 * "board", in the message) or of a newer format version.
 */
export function decodeCanvasFile(magic: string, bytes: Uint8Array, noun: string): Uint8Array {
  const expected = magicBytes(magic);
  if (bytes.length < HEADER_SIZE || expected.some((byte, i) => bytes[i] !== byte)) {
    throw new Error(`This isn't a Cloudy Canvas ${noun} file.`);
  }
  const version = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true);
  if (version > CURRENT_FORMAT_VERSION) {
    throw new Error(
      `This ${noun} was saved by a newer version of Cloudy Canvas. Update the app to open it.`,
    );
  }
  return bytes.subarray(HEADER_SIZE);
}
