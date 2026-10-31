/** The media type of a picture file from its first bytes (SVG when it's text starting with `<`). */
export function imageType(bytes: Uint8Array): string {
  const [a, b, c, d] = bytes;
  if (a === 0x89 && b === 0x50) return "image/png";
  if (a === 0xff && b === 0xd8) return "image/jpeg";
  if (a === 0x47 && b === 0x49) return "image/gif";
  if (a === 0x52 && b === 0x49 && c === 0x46 && d === 0x46) return "image/webp";
  const head = new TextDecoder().decode(bytes.subarray(0, 256)).trimStart();
  if (head.startsWith("<")) return "image/svg+xml";
  return "application/octet-stream";
}
