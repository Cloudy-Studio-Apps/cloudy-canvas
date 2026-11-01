/** What file names can't hold on any of the systems the app runs on. */
const UNSAFE_CHARS = /[\\/:*?"<>|\p{Cc}]/gu;
/** Names Windows keeps for itself, whatever follows the first dot. */
const RESERVED_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?=\.|$)/i;

/**
 * A file name no other export has: `used` holds the ones taken (compared as Windows and macOS do,
 * ignoring case) and gets this one. A taken name numbers the layer's part, so a second "Icon"
 * gives `Icon 2@2x.png`.
 */
export function uniqueFileName(
  layer: string,
  suffix: string,
  extension: string,
  used: Set<string>,
): string {
  const base = safeName(layer) || "layer";
  return uniqueName(base, `${safeName(suffix)}.${extension}`, used);
}

/** A folder name no other has, by the same rules: a taken one is numbered. */
export function uniqueFolderName(name: string, used: Set<string>): string {
  return uniqueName(safeName(name) || "page", "", used);
}

function safeName(name: string): string {
  // Windows drops trailing dots and spaces.
  const safe = name
    .replace(UNSAFE_CHARS, "_")
    .replace(/[. ]+$/, "")
    .trimStart();
  return safe.replace(RESERVED_NAME, "$1_");
}

function uniqueName(base: string, end: string, used: Set<string>): string {
  for (let n = 1; ; n++) {
    const name = n === 1 ? `${base}${end}` : `${base} ${n}${end}`;
    if (!used.has(name.toLowerCase())) {
      used.add(name.toLowerCase());
      return name;
    }
  }
}
