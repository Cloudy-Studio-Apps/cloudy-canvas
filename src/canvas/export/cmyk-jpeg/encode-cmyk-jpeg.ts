import { forwardDct } from "./forward-dct";
import {
  AC_COUNTS,
  AC_VALUES,
  BASE_QUANTIZATION,
  DC_COUNTS,
  DC_VALUES,
  ZIGZAG,
} from "./jpeg-tables";

/** Each row and column's scale in the DCT above. */
const AAN = [1, 1.387039845, 1.306562965, 1.175875602, 1, 0.785694958, 0.5411961, 0.275899379];
const CHANNELS = 4;

/** A symbol's Huffman code: its bits and how many. */
type HuffmanTable = (readonly [code: number, length: number] | undefined)[];

function huffmanTable(counts: readonly number[], values: readonly number[]): HuffmanTable {
  const table: HuffmanTable = [];
  let code = 0;
  let at = 0;
  counts.forEach((count, i) => {
    for (let n = 0; n < count; n++) table[values[at++]!] = [code++, i + 1];
    code <<= 1;
  });
  return table;
}

const DC_TABLE = huffmanTable(DC_COUNTS, DC_VALUES);
const AC_TABLE = huffmanTable(AC_COUNTS, AC_VALUES);

/** A growing file, with JPEG's bit stream (a 0xff byte is followed by a 0). */
class JpegWriter {
  private bytes = new Uint8Array(1 << 20);
  private length = 0;
  private buffer = 0;
  private bits = 0;

  byte(value: number): void {
    if (this.length === this.bytes.length) {
      const grown = new Uint8Array(this.bytes.length * 2);
      grown.set(this.bytes);
      this.bytes = grown;
    }
    this.bytes[this.length++] = value;
  }

  word(value: number): void {
    this.byte(value >> 8);
    this.byte(value & 255);
  }

  put(values: readonly number[]): void {
    for (const value of values) this.byte(value);
  }

  code(value: number, length: number): void {
    this.buffer = (this.buffer << length) | (value & ((1 << length) - 1));
    this.bits += length;
    while (this.bits >= 8) {
      const byte = (this.buffer >> (this.bits - 8)) & 255;
      this.byte(byte);
      if (byte === 255) this.byte(0);
      this.bits -= 8;
    }
    this.buffer &= (1 << this.bits) - 1;
  }

  /** Pads the last byte with ones. */
  flush(): void {
    if (this.bits > 0) this.code(0x7f, 8 - this.bits);
  }

  file(): Uint8Array {
    return this.bytes.slice(0, this.length);
  }
}

/** A value's size category and its bits, as JPEG codes coefficients. */
function category(value: number): [size: number, bits: number] {
  const magnitude = Math.abs(value);
  const size = magnitude === 0 ? 0 : 32 - Math.clz32(magnitude);
  return [size, value < 0 ? value + (1 << size) - 1 : value];
}

function quantization(quality: number): { table: number[]; divisors: Float32Array } {
  const percent = Math.min(100, Math.max(1, quality * 100));
  const scale = percent < 50 ? 5000 / percent : 200 - percent * 2;
  const table = BASE_QUANTIZATION.map((q) =>
    Math.min(255, Math.max(1, Math.floor((q * scale + 50) / 100))),
  );
  const divisors = new Float32Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      divisors[y * 8 + x] = 1 / (table[y * 8 + x]! * AAN[y]! * AAN[x]! * 8);
    }
  }
  return { table, divisors };
}

function writeHeaders(out: JpegWriter, width: number, height: number, table: number[]): void {
  out.word(0xffd8);
  // Adobe's marker: four channels, no color transform. Readers expect its inverted ink values.
  out.word(0xffee);
  out.word(14);
  out.put([0x41, 0x64, 0x6f, 0x62, 0x65, 0, 100, 0, 0, 0, 0, 0]);
  out.word(0xffdb);
  out.word(67);
  out.byte(0);
  for (const at of ZIGZAG) out.byte(table[at]!);
  out.word(0xffc0);
  out.word(8 + CHANNELS * 3);
  out.byte(8);
  out.word(height);
  out.word(width);
  out.byte(CHANNELS);
  for (let id = 1; id <= CHANNELS; id++) out.put([id, 0x11, 0]);
  writeHuffman(out, 0x00, DC_COUNTS, DC_VALUES);
  writeHuffman(out, 0x10, AC_COUNTS, AC_VALUES);
  out.word(0xffda);
  out.word(6 + CHANNELS * 2);
  out.byte(CHANNELS);
  for (let id = 1; id <= CHANNELS; id++) out.put([id, 0]);
  out.put([0, 63, 0]);
}

function writeHuffman(
  out: JpegWriter,
  id: number,
  counts: readonly number[],
  values: readonly number[],
): void {
  out.word(0xffc4);
  out.word(19 + values.length);
  out.byte(id);
  out.put(counts);
  out.put(values);
}

function writeBlock(
  out: JpegWriter,
  block: Float32Array,
  divisors: Float32Array,
  previous: number,
): number {
  forwardDct(block);
  const coefficients = new Int32Array(64);
  ZIGZAG.forEach((at, i) => {
    coefficients[i] = Math.round(block[at]! * divisors[at]!);
  });
  const dc = coefficients[0]!;
  const [size, bits] = category(dc - previous);
  const [code, length] = DC_TABLE[size]!;
  out.code(code, length);
  if (size > 0) out.code(bits, size);
  let zeros = 0;
  for (let i = 1; i < 64; i++) {
    const value = coefficients[i]!;
    if (value === 0) {
      zeros++;
      continue;
    }
    for (; zeros > 15; zeros -= 16) out.code(...AC_TABLE[0xf0]!);
    const [acSize, acBits] = category(value);
    out.code(...AC_TABLE[(zeros << 4) | acSize]!);
    out.code(acBits, acSize);
    zeros = 0;
  }
  if (zeros > 0) out.code(...AC_TABLE[0]!);
  return dc;
}

/**
 * Interleaved CMYK bytes (255 is full ink) as a baseline JPEG, which no canvas can write. It's
 * stored as Adobe's do, with ink inverted: a PDF reads it back with `/Decode [1 0 1 0 1 0 1 0]`.
 * `quality` is 0–1.
 */
export function encodeCmykJpeg(
  cmyk: Uint8Array,
  width: number,
  height: number,
  quality: number,
): Uint8Array {
  const { table, divisors } = quantization(quality);
  const out = new JpegWriter();
  writeHeaders(out, width, height, table);
  const previous = [0, 0, 0, 0];
  const block = new Float32Array(64);
  for (let top = 0; top < height; top += 8) {
    for (let left = 0; left < width; left += 8) {
      for (let channel = 0; channel < CHANNELS; channel++) {
        for (let y = 0; y < 8; y++) {
          const row = Math.min(top + y, height - 1);
          for (let x = 0; x < 8; x++) {
            const column = Math.min(left + x, width - 1);
            const ink = cmyk[(row * width + column) * CHANNELS + channel]!;
            block[y * 8 + x] = 255 - ink - 128;
          }
        }
        previous[channel] = writeBlock(out, block, divisors, previous[channel]!);
      }
    }
  }
  out.flush();
  out.word(0xffd9);
  return out.file();
}
