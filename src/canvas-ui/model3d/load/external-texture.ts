/**
 * A file a model refers to that wasn't given to the loader is answered with a 1x1 PNG picture whose
 * URL carries the file's name after `#`, so which textures are external (and which file they name)
 * can be read back from the loaded texture's image.
 */
const BLANK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const FLAG = "#cc-external=";

/** `decodeURIComponent`, or the text as it is when it is not valid percent-encoding. */
export function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** The stand-in URL for a file that isn't available. */
export function externalUrl(file: string): string {
  return `${BLANK}${FLAG}${encodeURIComponent(file)}`;
}

/** The file a loaded texture's image stands in for, or `null` when it is real. */
export function externalFileOf(image: unknown): string | null {
  const src = (image as { src?: unknown } | null | undefined)?.src;
  if (typeof src !== "string") return null;
  const at = src.indexOf(FLAG);
  return at < 0 ? null : safeDecode(src.slice(at + FLAG.length));
}

/** The last part of a path written with `/` or `\`. */
export function baseName(path: string): string {
  const clean = path.split(/[?#]/)[0] ?? path;
  return clean.slice(Math.max(clean.lastIndexOf("/"), clean.lastIndexOf("\\")) + 1);
}
