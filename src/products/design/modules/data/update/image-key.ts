/** Base64 data written bare: only base64 characters, long enough not to be a short name. */
const BARE_BASE64 = /^[A-Za-z0-9+/]{64,}={0,2}$/;

const TWO_32 = 4294967296;

/**
 * FNV-1a, 64 bits, over the text's UTF-16 units, kept as two 32-bit halves (no BigInt, so a
 * picture megabytes long hashes quickly); 16 hex digits.
 */
function fnv1a64(text: string): string {
  // Offset basis 0xcbf29ce484222325; prime 0x100000001b3 = 2^40 + 0x1b3.
  let hi = 0xcbf29ce4;
  let lo = 0x84222325;
  for (let i = 0; i < text.length; i++) {
    lo = (lo ^ text.charCodeAt(i)) >>> 0;
    const low = lo * 0x1b3;
    const carry = Math.floor(low / TWO_32);
    hi = (hi * 0x1b3 + carry + ((lo * 256) % TWO_32)) % TWO_32;
    lo = low % TWO_32;
  }
  return hi.toString(16).padStart(8, "0") + lo.toString(16).padStart(8, "0");
}

/**
 * The key a source's `images` keeps a picture under, by the value that names it: a URL or a file
 * name as it is, base64 data (a `data:` URL or bare) as `"b64:"` + a 64-bit FNV-1a hash of the
 * whole text + `:` + its length, so a large picture isn't a key and two pictures of one size
 * don't share one.
 */
export function imageKey(value: string): string {
  const text = value.trim();
  if (text.startsWith("data:") || BARE_BASE64.test(text)) {
    return `b64:${fnv1a64(text)}:${text.length}`;
  }
  return text;
}
