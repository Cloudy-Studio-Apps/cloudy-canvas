const utf8 = new TextDecoder();

// Shared views to read a float's bits.
const floatBits = new Float32Array(1);
const intBits = new Int32Array(floatBits.buffer);

/** Reads Kiwi's encodings (varints, var-floats, null-terminated strings) from bytes in order. */
export class ByteReader {
  private readonly data: Uint8Array;
  private index = 0;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  readByte(): number {
    const byte = this.data[this.index];
    if (byte === undefined) throw new Error("The Figma file ends too early.");
    this.index++;
    return byte;
  }

  readBool(): boolean {
    return this.readByte() !== 0;
  }

  readVarUint(): number {
    let value = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = this.readByte();
      value |= (byte & 127) << shift;
      shift += 7;
    } while (byte & 128 && shift < 35);
    return value >>> 0;
  }

  /** A zigzag-encoded signed varint. */
  readVarInt(): number {
    const value = this.readVarUint() | 0;
    return value & 1 ? ~(value >>> 1) : value >>> 1;
  }

  /** A float32 whose exponent comes first, so 0 takes one byte. */
  readVarFloat(): number {
    const first = this.readByte();
    if (first === 0) return 0;
    const bits = first | (this.readByte() << 8) | (this.readByte() << 16) | (this.readByte() << 24);
    intBits[0] = (bits << 23) | (bits >>> 9);
    return floatBits[0] ?? 0;
  }

  readVarUint64(): bigint {
    let value = 0n;
    let shift = 0n;
    let byte = this.readByte();
    while (byte & 128 && shift < 56n) {
      value |= BigInt(byte & 127) << shift;
      shift += 7n;
      byte = this.readByte();
    }
    return value | (BigInt(byte) << shift);
  }

  readVarInt64(): bigint {
    const value = this.readVarUint64();
    return value & 1n ? ~(value >> 1n) : value >> 1n;
  }

  /** UTF-8 up to a zero byte. */
  readString(): string {
    const end = this.data.indexOf(0, this.index);
    if (end < 0) throw new Error("The Figma file ends too early.");
    const text = utf8.decode(this.data.subarray(this.index, end));
    this.index = end + 1;
    return text;
  }

  readByteArray(): Uint8Array {
    const length = this.readVarUint();
    const end = this.index + length;
    if (end > this.data.length) throw new Error("The Figma file ends too early.");
    const bytes = this.data.slice(this.index, end);
    this.index = end;
    return bytes;
  }
}
