import { inflateSync } from "fflate";
import { decompress } from "fzstd";

const ZSTD_MAGIC = [0x28, 0xb5, 0x2f, 0xfd];

/** A chunk of a `.fig` canvas: zstd in newer files, raw deflate in older ones. */
export function decompressChunk(chunk: Uint8Array): Uint8Array {
  const zstd = ZSTD_MAGIC.every((byte, i) => chunk[i] === byte);
  return zstd ? decompress(chunk) : inflateSync(chunk);
}
