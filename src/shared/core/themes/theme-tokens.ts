/**
 * Every semantic token a theme can set (the CSS custom properties without `--`). Palette scales
 * (`--ice-*`, `--seal-*`, …) aren't here: themes give meanings, and may use the scales as values
 * (`var(--seal-900)`).
 */
export const THEME_TOKEN_NAMES = [
  // Surfaces and text
  "background",
  "foreground",
  "surface",
  "surface-foreground",
  "surface-sunken",
  "overlay",
  "muted",
  "muted-foreground",
  "subtle-foreground",
  "hover",
  "popover",
  "popover-foreground",
  // Canvas (read by the editors and handed to the engine)
  "canvas-background",
  "canvas-grid",
  "canvas-selection",
  "canvas-snap",
  "canvas-relation",
  "canvas-ruler",
  "canvas-ruler-foreground",
  "canvas-ruler-border",
  // Code
  "syntax-keyword",
  "syntax-definition",
  "syntax-property",
  "syntax-type",
  "syntax-setting",
  "syntax-string",
  "syntax-number",
  "syntax-operator",
  "syntax-punctuation",
  "syntax-comment",
  "syntax-error",
  // Lines
  "border",
  "border-strong",
  "input",
  "ring",
  // Roles
  "primary",
  "primary-hover",
  "primary-foreground",
  "primary-soft",
  "primary-soft-foreground",
  "secondary",
  "secondary-hover",
  "secondary-foreground",
  "accent",
  "accent-hover",
  "accent-foreground",
  "accent-soft",
  "accent-soft-foreground",
  "board",
  "board-foreground",
  "board-soft",
  "design",
  "design-foreground",
  "design-soft",
  "success",
  "success-soft",
  "warning",
  "warning-soft",
  "destructive",
  "destructive-hover",
  "destructive-foreground",
  "destructive-soft",
  // Elevation: an `H S% L%` triple the shadows are tinted with.
  "shadow-color",
] as const;

const NAMES: ReadonlySet<string> = new Set(THEME_TOKEN_NAMES);

export function isThemeToken(name: string): name is (typeof THEME_TOKEN_NAMES)[number] {
  return NAMES.has(name);
}
