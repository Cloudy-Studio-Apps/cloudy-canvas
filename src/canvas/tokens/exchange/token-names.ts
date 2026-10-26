/** A path's words: accents stripped, split on `/`, spaces, dashes, underscores and dots. */
function wordsOf(path: string): string[] {
  return path
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word.length > 0);
}

/** A path as a lowercase ASCII slug (`"Brand / Primário 500"` → `brand-primario-500`). */
export function slugPath(path: string, separator: "-" | "_" = "-"): string {
  return wordsOf(path).join(separator).toLowerCase() || "token";
}

/**
 * A path as a camel-cased identifier (`"space/2xl"` → `space2xl`; `upper`: `Space2xl`). One
 * starting with a digit gets a leading `_`, so it stays a valid name in Swift and Kotlin.
 */
export function camelPath(path: string, upper = false): string {
  const words = wordsOf(path).map((word, i) => {
    const lower = word.toLowerCase();
    return i === 0 && !upper ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
  });
  const name = words.join("") || "token";
  return /^[0-9]/.test(name) ? `_${name}` : name;
}

/** The names with repeats made unique, in order (`a`, `a-2`, `a-3`; `separator` before the number). */
export function uniqueNames(names: readonly string[], separator = "-"): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    let candidate = name;
    for (let n = 2; used.has(candidate); n++) candidate = `${name}${separator}${n}`;
    used.add(candidate);
    return candidate;
  });
}
