import { formatNumber } from "./code-names";
import { cssModeBlocks, cssShadow, cssValue } from "./css-values";
import type { CodeTokens, CodeVariable } from "./code-tokens.types";
import { uniqueNames } from "../token-names";

/** Tailwind v4's theme namespaces, by what a variable is for. */
const NAMESPACES: [test: (v: CodeVariable) => boolean, namespace: string, words: string[]][] = [
  [(v) => v.type === "color", "color", ["color", "colors", "colour"]],
  [(v) => v.scopes.includes("corner-radius"), "radius", ["radius", "radii", "rounded"]],
  [(v) => v.scopes.includes("font-size"), "text", ["text", "font-size", "size"]],
  [(v) => v.scopes.includes("font-family"), "font", ["font", "fonts", "family"]],
  [(v) => v.scopes.includes("font-weight"), "font-weight", ["font-weight", "weight"]],
  [(v) => v.scopes.includes("line-height"), "leading", ["leading", "line-height"]],
  [(v) => v.scopes.includes("letter-spacing"), "tracking", ["tracking", "letter-spacing"]],
  [(v) => v.scopes.includes("opacity"), "opacity", ["opacity"]],
  [(v) => v.unit === "px", "spacing", ["spacing", "space", "size", "sizes"]],
];

/**
 * Tailwind v4: an `@theme` block with each variable in its namespace (`--color-brand-500`,
 * `--spacing-md`, `--radius-sm`, `--text-lg`, `--font-heading`, `--shadow-card`; a path's first
 * word dropped when it repeats the namespace), resolved values, then the mode blocks.
 */
export function toTailwind(tokens: CodeTokens): string {
  const names = uniqueNames(tokens.variables.map(themeName));
  const nameOf = new Map(tokens.variables.map((v, i) => [v.id, names[i] as string]));
  const lines = tokens.variables.map(
    (v) => `  --${nameOf.get(v.id)}: ${cssValue(v.base, v.unit)};`,
  );
  for (const t of tokens.textStyles) {
    lines.push(
      `  --text-${t.slug}: ${formatNumber(t.size)}px;`,
      `  --text-${t.slug}--line-height: ${formatNumber(t.lineHeight)};`,
      `  --text-${t.slug}--font-weight: ${t.weight};`,
      `  --text-${t.slug}--letter-spacing: ${formatNumber(t.letterSpacing)}px;`,
    );
  }
  for (const shadow of tokens.shadows)
    lines.push(`  --shadow-${shadow.slug}: ${cssShadow(shadow.layers)};`);
  const parts = [
    `/* ${tokens.title}: design tokens from Cloudy Canvas, for Tailwind CSS v4 */`,
    '@import "tailwindcss";',
    `@theme {\n${lines.join("\n")}\n}`,
    ...cssModeBlocks(tokens, (v) => nameOf.get(v.id) ?? v.cssName, false),
  ];
  return `${parts.join("\n\n")}\n`;
}

function themeName(v: CodeVariable): string {
  const found = NAMESPACES.find(([test]) => test(v));
  if (!found) return v.cssName;
  const [, namespace, words] = found;
  const rest = words.reduce(
    (name, word) => (name.startsWith(`${word}-`) ? name.slice(word.length + 1) : name),
    v.cssName,
  );
  return `${namespace}-${rest || v.cssName}`;
}
