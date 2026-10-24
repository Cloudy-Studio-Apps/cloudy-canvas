import { DENSITY_METRICS, DENSITY_PADDING } from "./theme-density";
import type { ResolvedTheme, ThemeDensity, ThemeTokens } from "./theme.types";

/**
 * The CSS that applies `theme` inside `scope`: `:root` for the app (written stronger than
 * tokens.css's own rules, so it wins whatever order the sheets load in), or a class for an element
 * that must look like another theme (exports' canvas colors). Product tokens apply inside
 * `[data-product="<id>"]`. `density` overrides the theme's own.
 */
export function themeCss(theme: ResolvedTheme, scope = ":root", density?: ThemeDensity): string {
  const root = scope === ":root" ? "html:root" : scope;
  const metrics = DENSITY_METRICS[density ?? theme.density];
  const vars: Record<string, string> = {
    ...prefixed(theme.tokens),
    "--corner": `${theme.corners.control}px`,
    "--corner-card": `${theme.corners.card}px`,
    "--corner-max": `${theme.corners.max}px`,
    "--control-h": `${metrics.controlHeight}px`,
    "--control-h-sm": `${metrics.controlHeightSm}px`,
    "--control-h-lg": `${metrics.controlHeightLg}px`,
    "--control-px": `${DENSITY_PADDING[density ?? theme.density]}px`,
    "--row-h": `${metrics.rowHeight}px`,
    ...(theme.fonts.sans ? { "--theme-font-sans": theme.fonts.sans } : {}),
    ...(theme.fonts.mono ? { "--theme-font-mono": theme.fonts.mono } : {}),
  };
  const blocks = [`${root} {\n${declarations(vars)}  color-scheme: ${theme.appearance};\n}`];
  for (const [product, tokens] of Object.entries(theme.products)) {
    const inside = `[data-product="${product}"]`;
    const selector =
      scope === ":root" ? `:root ${inside}` : `${scope}${inside}, ${scope} ${inside}`;
    blocks.push(`${selector} {\n${declarations(prefixed(tokens))}}`);
  }
  return blocks.join("\n");
}

function prefixed(tokens: ThemeTokens): Record<string, string> {
  return Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--${name}`, value]));
}

function declarations(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};\n`)
    .join("");
}
