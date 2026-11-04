/** Names a source can't take: the brochure's own placeholders use them. */
export const RESERVED_NAMES = ["page", "pages", "title", "section", "date", "toc", "item"] as const;

const FALLBACK = "data";

/** Lower-case identifier text (`[a-z_][a-z0-9_]*`): accents dropped, anything else as `_`. */
function identifier(text: string): string {
  const id = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!id) return FALLBACK;
  return /^[0-9]/.test(id) ? `${FALLBACK}_${id}` : id;
}

/**
 * The name a source gets from `wanted`: an identifier that bindings can use (`products.price`),
 * never a reserved word, made unique among `taken` with `_2`, `_3`…
 */
export function sourceName(wanted: string, taken: string[]): string {
  const base = identifier(wanted);
  const used = new Set([...taken, ...RESERVED_NAMES]);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}
