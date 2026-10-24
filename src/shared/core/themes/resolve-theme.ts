import type { ThemeRegistry } from "./theme-registry";
import type { ResolvedTheme, ThemeDefinition, ThemeTokens } from "./theme.types";

/**
 * `theme` with its `extends` chain merged over the base theme, so every value is set. A chain
 * that loops or names a theme that isn't there stops where it breaks, at the base.
 */
export function resolveTheme(theme: ThemeDefinition, registry: ThemeRegistry): ResolvedTheme {
  const base = registry.base();
  const chain: ThemeDefinition[] = [];
  const seen = new Set<string>();
  let current: ThemeDefinition | undefined = theme;
  while (current && !seen.has(current.id) && current.id !== base.id) {
    seen.add(current.id);
    chain.unshift(current);
    current = current.extends ? registry.get(current.extends) : undefined;
  }
  chain.unshift(base);

  let tokens: ThemeTokens = {};
  const products: Record<string, ThemeTokens> = {};
  for (const step of chain) {
    tokens = { ...tokens, ...step.tokens };
    for (const [product, values] of Object.entries(step.products ?? {})) {
      products[product] = { ...products[product], ...values };
    }
  }
  const pick = <K extends "fonts" | "corners">(key: K) =>
    Object.assign({}, ...chain.map((step) => step[key] ?? {})) as NonNullable<ThemeDefinition[K]>;
  const fonts = pick("fonts");
  const corners = pick("corners");
  const density = [...chain].reverse().find((step) => step.density)?.density ?? "default";

  return {
    id: theme.id,
    label: theme.label,
    appearance: theme.appearance,
    tokens,
    products,
    fonts: { sans: fonts.sans ?? "", mono: fonts.mono ?? "" },
    density,
    corners: {
      control: clampCorner(corners.control ?? 4),
      card: clampCorner(corners.card ?? 6),
      max: clampCorner(corners.max ?? 8),
    },
  };
}

/** The UI stays sharp: no radius past 8px. */
function clampCorner(px: number): number {
  return Math.min(8, Math.max(0, px));
}
