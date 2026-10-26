import { splitTokenColor } from "../../token-color";
import { formatNumber } from "./code-names";
import type {
  CodeModeValue,
  CodeTokens,
  CodeUnit,
  CodeValue,
  CodeVariable,
} from "./code-tokens.types";

/** A value as CSS writes it: colors in hex, lengths in px, texts quoted. */
export function cssValue(value: CodeValue, unit: CodeUnit): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    return unit === "px" || unit === "font-size" ? `${formatNumber(value)}px` : formatNumber(value);
  }
  if (/^#[0-9A-F]{8}$/i.test(value)) {
    const { hex, alpha } = splitTokenColor(value);
    return alpha >= 1 ? hex.toLowerCase() : value.toLowerCase();
  }
  return JSON.stringify(value);
}

/** A variable's own value in a mode as CSS: `var(--target)` for an alias, `calc()` for an expression. */
export function cssModeValue(v: CodeVariable, entry: CodeModeValue, references: boolean): string {
  if (references && entry.own && "alias" in entry.own) return `var(--${entry.own.alias})`;
  if (references && entry.own && "calc" in entry.own) return entry.own.calc;
  return cssValue(entry.value, v.unit);
}

/**
 * The mode blocks after the base declarations: `[data-theme="dark"] { … }` per non-base mode,
 * and a `prefers-color-scheme` block when an axis has a Dark mode and starts with another.
 * `name` gives each declaration's custom property; `references` writes aliases as `var()`.
 */
export function cssModeBlocks(
  tokens: CodeTokens,
  name: (v: CodeVariable) => string,
  references: boolean,
): string[] {
  const blocks: string[] = [];
  for (const axis of tokens.axes) {
    for (const mode of axis.modes.slice(1)) {
      const lines = tokens.variables.flatMap((v) => {
        const entry = v.modes.find((m) => m.axis === axis.id && m.mode === mode.id);
        // With references, only the variable's own value changes; aliases follow by themselves.
        // With references, an alias of a listed variable follows it by itself.
        if (!entry || (references && !entry.own && (v.alias || v.calc))) return [];
        return [`  --${name(v)}: ${cssModeValue(v, entry, references)};`];
      });
      if (lines.length === 0) continue;
      blocks.push(`[data-${axis.slug}="${mode.slug}"] {\n${lines.join("\n")}\n}`);
      const base = axis.modes[0];
      if (/^dark$/i.test(mode.name) && base && !/^dark$/i.test(base.name)) {
        const indented = lines.map((line) => `  ${line}`).join("\n");
        blocks.push(
          `@media (prefers-color-scheme: dark) {\n  :root:not([data-${axis.slug}]) {\n${indented}\n  }\n}`,
        );
      }
    }
  }
  return blocks;
}

/** A shadow style's layers as a CSS `box-shadow` value. */
export function cssShadow(layers: CodeTokens["shadows"][number]["layers"]): string {
  return layers
    .map((l) =>
      [
        l.inset ? "inset" : "",
        `${formatNumber(l.x)}px`,
        `${formatNumber(l.y)}px`,
        `${formatNumber(l.blur)}px`,
        `${formatNumber(l.spread)}px`,
        cssValue(l.color, "none"),
      ]
        .filter(Boolean)
        .join(" "),
    )
    .reverse()
    .join(", ");
}
