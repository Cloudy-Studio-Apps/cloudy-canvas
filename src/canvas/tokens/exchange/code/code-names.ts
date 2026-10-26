import { camelPath, slugPath, uniqueNames } from "../token-names";

/** Words Swift and Kotlin reserve; names equal to one are written in backticks. */
const RESERVED = new Set([
  "as",
  "break",
  "case",
  "catch",
  "class",
  "continue",
  "default",
  "defer",
  "do",
  "else",
  "enum",
  "extension",
  "false",
  "for",
  "fun",
  "func",
  "guard",
  "if",
  "import",
  "in",
  "init",
  "interface",
  "internal",
  "is",
  "let",
  "nil",
  "null",
  "object",
  "open",
  "operator",
  "package",
  "private",
  "protocol",
  "public",
  "repeat",
  "return",
  "self",
  "static",
  "struct",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typealias",
  "val",
  "var",
  "when",
  "where",
  "while",
]);

/** A name, in backticks when Swift or Kotlin reserve it. */
export function safeIdentifier(name: string): string {
  return RESERVED.has(name) ? `\`${name}\`` : name;
}

/**
 * Names for paths of several collections: each path's own, the collection's added in front when
 * two collections share it, and numbered as a last resort. `own` gives a path's name in code when
 * it has one (its code syntax).
 */
export function namesFor(
  items: readonly { path: string; collection: string; own?: string | null }[],
  style: "slug" | "camel" | "pascal",
): string[] {
  const make = (path: string) =>
    style === "slug" ? slugPath(path) : camelPath(path, style === "pascal");
  const plain = items.map((item) => item.own || make(item.path));
  const count = new Map<string, number>();
  for (const name of plain) count.set(name, (count.get(name) ?? 0) + 1);
  const prefixed = items.map((item, i) => {
    const name = plain[i] as string;
    if (item.own || (count.get(name) ?? 0) < 2) return name;
    return make(`${item.collection}/${item.path}`);
  });
  return uniqueNames(prefixed, style === "slug" ? "-" : "");
}

/** A number without float noise (`0.1 + 0.2` → `0.3`), at most 4 decimals. */
export function formatNumber(n: number): string {
  return String(Math.round(n * 10000) / 10000);
}
