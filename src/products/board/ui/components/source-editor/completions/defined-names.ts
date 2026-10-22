/**
 * Names the text defines with one of `keywords` (`Table users`, `Entity "Cliente VIP"`), so names
 * typed but not yet applied are offered too.
 */
export function definedNames(text: string, keywords: readonly string[]): string[] {
  const pattern = new RegExp(
    `^\\s*(?:${keywords.join("|")})\\s+("[^"\\n]*"|[\\p{L}_][\\p{L}\\p{N}_]*)`,
    "gimu",
  );
  const names = new Set<string>();
  for (const match of text.matchAll(pattern)) {
    const name = match[1]!;
    names.add(name.startsWith('"') ? name.slice(1, -1) : name);
  }
  return [...names];
}

/** A name as it must be written: quoted when it isn't a plain word. */
export function writtenName(name: string): string {
  return /^[\p{L}_][\p{L}\p{N}_]*$/u.test(name) ? name : `"${name}"`;
}
