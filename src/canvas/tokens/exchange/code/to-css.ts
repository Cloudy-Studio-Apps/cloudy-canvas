import { formatNumber } from "./code-names";
import { cssModeBlocks, cssShadow, cssValue } from "./css-values";
import type { CodeTokens } from "./code-tokens.types";

/**
 * CSS custom properties: `:root` with every variable (aliases as `var()`, expressions as `calc()`), a block per mode
 * (`[data-theme="dark"]`, and `prefers-color-scheme` for a Dark mode), shadow styles as
 * `--shadow-*` and text styles as `.text-*` classes.
 */
export function toCss(tokens: CodeTokens): string {
  const lines = tokens.variables.map(
    (v) =>
      `  --${v.cssName}: ${v.alias ? `var(--${v.alias})` : (v.calc ?? cssValue(v.base, v.unit))};`,
  );
  for (const shadow of tokens.shadows)
    lines.push(`  --shadow-${shadow.slug}: ${cssShadow(shadow.layers)};`);
  const parts = [
    `/* ${tokens.title}: design tokens from Cloudy Canvas */`,
    `:root {\n${lines.join("\n")}\n}`,
  ];
  parts.push(...cssModeBlocks(tokens, (v) => v.cssName, true));
  for (const t of tokens.textStyles) {
    const prop = (key: keyof typeof t.vars, raw: string) =>
      t.vars[key] ? `var(--${t.vars[key]})` : raw;
    parts.push(
      [
        `.text-${t.slug} {`,
        `  font-family: ${prop("family", JSON.stringify(t.family))};`,
        `  font-size: ${prop("size", `${formatNumber(t.size)}px`)};`,
        `  font-weight: ${prop("weight", String(t.weight))};`,
        `  line-height: ${prop("lineHeight", formatNumber(t.lineHeight))};`,
        `  letter-spacing: ${prop("letterSpacing", `${formatNumber(t.letterSpacing)}px`)};`,
        "}",
      ].join("\n"),
    );
  }
  return `${parts.join("\n\n")}\n`;
}
