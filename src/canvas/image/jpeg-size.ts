import type { Size } from "../geometry.types";

/** Start-of-frame markers (SOF0–SOF15 but DHT, JPG and DAC), which carry the picture's size. */
function isFrameMarker(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

/**
 * A JPEG's size as decoders show it (EXIF orientations 5–8 swap its sides), from its frame header;
 * `null` when it isn't a JPEG or the header can't be found.
 */
export function jpegSize(data: Uint8Array): Size | null {
  if (data[0] !== 0xff || data[1] !== 0xd8) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let swapped = false;
  let i = 2;
  while (i + 4 <= data.length) {
    if (data[i] !== 0xff) return null;
    const marker = data[i + 1]!;
    // Fill bytes, and markers without a length.
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2;
      continue;
    }
    const length = view.getUint16(i + 2);
    if (marker === 0xe1) swapped ||= exifSwapsSides(view, i + 4, length - 2);
    if (isFrameMarker(marker)) {
      if (i + 9 > data.length) return null;
      const h = view.getUint16(i + 5);
      const w = view.getUint16(i + 7);
      if (w === 0 || h === 0) return null;
      return swapped ? { w: h, h: w } : { w, h };
    }
    i += 2 + length;
  }
  return null;
}

/** Whether an APP1 segment is EXIF with an orientation that turns the picture a quarter. */
function exifSwapsSides(view: DataView, start: number, length: number): boolean {
  const end = Math.min(view.byteLength, start + length);
  // "Exif\0\0", then a TIFF header.
  if (start + 14 > end || view.getUint32(start) !== 0x45786966 || view.getUint16(start + 4) !== 0)
    return false;
  const tiff = start + 6;
  const order = view.getUint16(tiff);
  if (order !== 0x4949 && order !== 0x4d4d) return false;
  const little = order === 0x4949;
  const ifd = tiff + view.getUint32(tiff + 4, little);
  if (ifd + 2 > end) return false;
  const count = view.getUint16(ifd, little);
  for (let n = 0; n < count; n++) {
    const entry = ifd + 2 + n * 12;
    if (entry + 12 > end) return false;
    if (view.getUint16(entry, little) !== 0x0112) continue;
    const orientation = view.getUint16(entry + 8, little);
    return orientation >= 5 && orientation <= 8;
  }
  return false;
}
