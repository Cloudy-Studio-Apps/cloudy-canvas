import type { Size } from "../geometry.types";
import { jpegSize } from "./jpeg-size";

/** Whether `data` starts with these ASCII characters at `offset`. */
function startsWith(data: Uint8Array, text: string, offset = 0): boolean {
  if (data.length < offset + text.length) return false;
  for (let i = 0; i < text.length; i++) if (data[offset + i] !== text.charCodeAt(i)) return false;
  return true;
}

function pngSize(data: Uint8Array, view: DataView): Size | null {
  if (data.length < 24 || data[0] !== 0x89 || !startsWith(data, "PNG", 1)) return null;
  return { w: view.getUint32(16), h: view.getUint32(20) };
}

function gifSize(data: Uint8Array, view: DataView): Size | null {
  if (data.length < 10 || !startsWith(data, "GIF8")) return null;
  return { w: view.getUint16(6, true), h: view.getUint16(8, true) };
}

function webpSize(data: Uint8Array, view: DataView): Size | null {
  if (data.length < 30 || !startsWith(data, "RIFF") || !startsWith(data, "WEBP", 8)) return null;
  if (startsWith(data, "VP8 ", 12))
    return { w: view.getUint16(26, true) & 0x3fff, h: view.getUint16(28, true) & 0x3fff };
  if (startsWith(data, "VP8L", 12)) {
    const bits = view.getUint32(21, true);
    return { w: (bits & 0x3fff) + 1, h: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (startsWith(data, "VP8X", 12)) {
    const w = 1 + (data[24]! | (data[25]! << 8) | (data[26]! << 16));
    const h = 1 + (data[27]! | (data[28]! << 8) | (data[29]! << 16));
    return { w, h };
  }
  return null;
}

/**
 * A raster image's size in pixels read from its file's header (PNG, JPEG with its EXIF turn, GIF,
 * WebP), without decoding it; `null` for other formats (SVG, AVIF, …) or a header it can't read.
 */
export function imageHeaderSize(data: Uint8Array): Size | null {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const size = pngSize(data, view) ?? jpegSize(data) ?? gifSize(data, view) ?? webpSize(data, view);
  return size && size.w > 0 && size.h > 0 ? size : null;
}
