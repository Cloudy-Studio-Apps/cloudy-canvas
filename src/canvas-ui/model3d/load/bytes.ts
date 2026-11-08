/** The bytes as a standalone ArrayBuffer (loaders want one that starts at 0). */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function toText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
