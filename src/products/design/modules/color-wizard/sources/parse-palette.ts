import { normalizeColorHex, parseCssColor } from "../color";
import type { ImportedColor } from "./sources.types";

/** "brand-primary-500" → "brand-primary": a name usable as a variable group. */
function roleName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const clean = name
    .toLowerCase()
    .replace(/[-_/.]?(50|[1-9]00|950)$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
  return clean || undefined;
}

/** The colors of a JSON token file (plain or DTCG `$value`), named by their keys. */
function fromJson(json: unknown, add: (hex: string | null, name?: string) => void): void {
  const walk = (node: unknown, key?: string) => {
    if (typeof node === "string") add(parseCssColor(node), key);
    else if (node && typeof node === "object") {
      const record = node as Record<string, unknown>;
      if ("$value" in record) add(parseCssColor(String(record.$value)), key);
      else if (typeof record.value === "string") add(parseCssColor(record.value), key);
      else Object.entries(record).forEach(([k, v]) => walk(v, k));
    }
  };
  walk(json);
}

/**
 * The colors in pasted text or a file: a Coolors link, JSON tokens, CSS custom properties, or any
 * hex, `rgb()`, `hsl()` or `oklch()` in it. Each color once, in the order found.
 */
export function parsePalette(text: string): ImportedColor[] {
  const out: ImportedColor[] = [];
  const add = (hex: string | null, name?: string) => {
    if (hex && !out.some((c) => c.hex === hex)) out.push({ hex, name: roleName(name) });
  };
  const coolors = text.match(/coolors\.co\/(?:palette\/)?([0-9a-f]{6}(?:-[0-9a-f]{6})+)/i);
  if (coolors?.[1]) {
    coolors[1].split("-").forEach((h) => add(normalizeColorHex(h)));
    return out;
  }
  try {
    fromJson(JSON.parse(text), add);
    if (out.length) return out;
  } catch {
    // Not JSON: read it as CSS or plain text.
  }
  for (const m of text.matchAll(/--([\w-]+)\s*:\s*([^;}\n]+)/g))
    add(parseCssColor(m[2] ?? ""), m[1]);
  if (out.length) return out;
  for (const m of text.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|(?:rgba?|hsla?|oklch)\([^)]*\)/gi)) {
    add(parseCssColor(m[0]));
  }
  return out;
}
