const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];

function startsWith(bytes: Uint8Array, magic: readonly number[], at = 0): boolean {
  return magic.every((b, i) => bytes[at + i] === b);
}

function ascii(text: string): number[] {
  return Array.from(text, (c) => c.charCodeAt(0));
}

/** Whether bytes start as SVG text (an XML prolog, comments or doctype allowed before `<svg`). */
function isSvg(bytes: Uint8Array): boolean {
  // The decoder drops a leading byte order mark.
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 2048));
  const text = head.trimStart();
  return text.startsWith("<") && /<svg[\s>]/i.test(text);
}

/** Whether bytes are a picture, by their first bytes: PNG, JPEG, GIF, WebP or SVG text. */
export function isImageBytes(bytes: Uint8Array): boolean {
  if (startsWith(bytes, PNG) || startsWith(bytes, JPEG)) return true;
  if (startsWith(bytes, ascii("GIF87a")) || startsWith(bytes, ascii("GIF89a"))) return true;
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return true;
  return isSvg(bytes);
}

function fromBase64(text: string): Uint8Array {
  const binary = atob(text.replace(/\s+/g, ""));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * The bytes a `data:` URL (base64 or percent-encoded) or bare base64 text holds, `null` when it
 * doesn't decode.
 */
export function decodeImageData(value: string): Uint8Array | null {
  const text = value.trim();
  try {
    if (!text.startsWith("data:")) return fromBase64(text);
    const comma = text.indexOf(",");
    if (comma < 0) return null;
    const meta = text.slice(5, comma);
    const payload = text.slice(comma + 1);
    if (/;base64$/i.test(meta)) return fromBase64(payload);
    return new TextEncoder().encode(decodeURIComponent(payload));
  } catch {
    return null;
  }
}
