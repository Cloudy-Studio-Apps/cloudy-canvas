import { formatNumber } from "./code-names";
import { cssShadow, cssValue } from "./css-values";
import type { CodeTokens } from "./code-tokens.types";

/**
 * SCSS: a `$variable` per variable (base modes), a map per other mode of what changes there,
 * shadow styles as `$shadow-*` and text styles as `text-*` mixins.
 */
export function toScss(tokens: CodeTokens): string {
  const parts = [
    `// ${tokens.title}: design tokens from Cloudy Canvas`,
    tokens.variables.map((v) => `$${v.cssName}: ${cssValue(v.base, v.unit)};`).join("\n"),
  ];
  for (const axis of tokens.axes) {
    for (const mode of axis.modes.slice(1)) {
      const entries = tokens.variables.flatMap((v) => {
        const entry = v.modes.find((m) => m.axis === axis.id && m.mode === mode.id);
        return entry ? [`  ${v.cssName}: ${cssValue(entry.value, v.unit)},`] : [];
      });
      if (entries.length > 0)
        parts.push(`$${axis.slug}-${mode.slug}: (\n${entries.join("\n")}\n);`);
    }
  }
  if (tokens.shadows.length > 0) {
    parts.push(tokens.shadows.map((s) => `$shadow-${s.slug}: ${cssShadow(s.layers)};`).join("\n"));
  }
  for (const t of tokens.textStyles) {
    parts.push(
      [
        `@mixin text-${t.slug} {`,
        `  font-family: ${JSON.stringify(t.family)};`,
        `  font-size: ${formatNumber(t.size)}px;`,
        `  font-weight: ${t.weight};`,
        `  line-height: ${formatNumber(t.lineHeight)};`,
        `  letter-spacing: ${formatNumber(t.letterSpacing)}px;`,
        "}",
      ].join("\n"),
    );
  }
  return `${parts.join("\n\n")}\n`;
}
