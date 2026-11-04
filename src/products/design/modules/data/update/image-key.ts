/** Base64 data written bare: only base64 characters, long enough not to be a short name. */
const BARE_BASE64 = /^[A-Za-z0-9+/]{64,}={0,2}$/;

/**
 * The key a source's `images` keeps a picture under, by the value that names it: a URL or a file
 * name as it is, base64 data (a `data:` URL or bare) as `"b64:"` + its first 64 characters + its
 * length, so a large picture isn't a key.
 */
export function imageKey(value: string): string {
  const text = value.trim();
  if (text.startsWith("data:") || BARE_BASE64.test(text)) {
    return `b64:${text.slice(0, 64)}${text.length}`;
  }
  return text;
}
