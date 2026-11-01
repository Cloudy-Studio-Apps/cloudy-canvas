import type { GifFrame } from "./gif-file.types";

/** LZW codes are at most 12 bits. */
const MAX_CODES = 4096;

/** The start and step of each of an interlaced frame's four passes over its rows. */
const INTERLACE_PASSES = [
  [0, 8],
  [4, 8],
  [2, 4],
  [1, 2],
] as const;

/**
 * Decompresses a frame's LZW data into one color index per pixel, row by row. Data that ends early
 * or is broken leaves the rest of the frame at index 0.
 */
function decompress(data: Uint8Array, frame: GifFrame): Uint8Array {
  const total = frame.w * frame.h;
  const pixels = new Uint8Array(total);
  const prefix = new Uint16Array(MAX_CODES);
  const suffix = new Uint8Array(MAX_CODES);
  const stack = new Uint8Array(MAX_CODES + 1);
  const clear = 1 << frame.minCodeSize;
  const end = clear + 1;
  for (let code = 0; code < clear; code++) suffix[code] = code;

  let codeSize = frame.minCodeSize + 1;
  let mask = (1 << codeSize) - 1;
  let next = clear + 2;
  let previous = -1;
  let first = 0;
  let bits = 0;
  let datum = 0;
  let at = frame.start;
  let left = 0;
  let out = 0;

  while (out < total) {
    while (bits < codeSize) {
      if (left === 0) {
        left = data[at++] ?? 0;
        if (left === 0) return pixels;
      }
      datum |= data[at++]! << bits;
      bits += 8;
      left--;
    }
    let code = datum & mask;
    datum >>>= codeSize;
    bits -= codeSize;

    if (code === clear) {
      codeSize = frame.minCodeSize + 1;
      mask = (1 << codeSize) - 1;
      next = clear + 2;
      previous = -1;
      continue;
    }
    if (code === end) return pixels;
    if (previous === -1) {
      if (code > clear) return pixels;
      pixels[out++] = code;
      previous = first = code;
      continue;
    }
    if (code > next) return pixels;

    const read = code;
    let top = 0;
    if (code === next) {
      stack[top++] = first;
      code = previous;
    }
    while (code > clear) {
      stack[top++] = suffix[code]!;
      code = prefix[code]!;
    }
    first = suffix[code]!;
    stack[top++] = first;
    if (next < MAX_CODES) {
      prefix[next] = previous;
      suffix[next] = first;
      next++;
      if ((next & mask) === 0 && next < MAX_CODES) {
        codeSize++;
        mask = (1 << codeSize) - 1;
      }
    }
    previous = read;
    while (top > 0 && out < total) pixels[out++] = stack[--top]!;
  }
  return pixels;
}

/** An interlaced frame's rows put in order. */
function deinterlace(pixels: Uint8Array, w: number, h: number): Uint8Array {
  const rows = new Uint8Array(pixels.length);
  let from = 0;
  for (const [start, step] of INTERLACE_PASSES) {
    for (let row = start; row < h; row += step) {
      rows.set(pixels.subarray(from, from + w), row * w);
      from += w;
    }
  }
  return rows;
}

/** A frame's color indices, one per pixel of its area, in reading order. */
export function decodeGifFrame(data: Uint8Array, frame: GifFrame): Uint8Array {
  const pixels = decompress(data, frame);
  return frame.interlaced ? deinterlace(pixels, frame.w, frame.h) : pixels;
}
