import type { ThemeDefinition } from "../theme.types";

/** Warm cream surfaces with a tangerine primary and a teal accent. */
export const ORANGE_LIGHT: ThemeDefinition = {
  id: "orange-light",
  label: "Orange",
  description: "Warm cream surfaces and tangerine.",
  appearance: "light",
  tokens: {
    background: "oklch(0.985 0.008 75)",
    foreground: "oklch(0.27 0.03 50)",
    surface: "oklch(1 0 0)",
    "surface-foreground": "oklch(0.27 0.03 50)",
    "surface-sunken": "oklch(0.96 0.012 70)",
    overlay: "oklch(0.2 0.03 50 / 0.4)",
    muted: "oklch(0.955 0.014 70)",
    "muted-foreground": "oklch(0.52 0.03 55)",
    "subtle-foreground": "oklch(0.64 0.025 60)",
    hover: "oklch(0.95 0.018 70)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.27 0.03 50)",

    "canvas-background": "oklch(0.985 0.008 75)",
    "canvas-grid": "oklch(0.86 0.025 65)",
    "canvas-selection": "oklch(0.66 0.19 45)",
    "canvas-snap": "oklch(0.58 0.22 15)",
    "canvas-relation": "oklch(0.52 0.03 55)",
    "canvas-ruler": "oklch(1 0 0)",
    "canvas-ruler-foreground": "oklch(0.52 0.03 55)",
    "canvas-ruler-border": "oklch(0.9 0.02 65)",

    "syntax-keyword": "oklch(0.55 0.17 40)",
    "syntax-definition": "oklch(0.22 0.03 50)",
    "syntax-property": "oklch(0.38 0.04 50)",
    "syntax-type": "oklch(0.5 0.1 195)",
    "syntax-setting": "oklch(0.5 0.15 340)",
    "syntax-string": "oklch(0.5 0.11 110)",
    "syntax-number": "oklch(0.55 0.18 25)",
    "syntax-operator": "oklch(0.6 0.16 50)",
    "syntax-punctuation": "oklch(0.52 0.03 55)",
    "syntax-comment": "oklch(0.6 0.025 60)",

    border: "oklch(0.91 0.018 65)",
    "border-strong": "oklch(0.86 0.025 65)",
    input: "oklch(0.86 0.025 65)",
    ring: "oklch(0.66 0.19 45)",

    primary: "oklch(0.64 0.19 45)",
    "primary-hover": "oklch(0.58 0.19 42)",
    "primary-foreground": "oklch(1 0 0)",
    "primary-soft": "oklch(0.95 0.045 60)",
    "primary-soft-foreground": "oklch(0.45 0.14 40)",
    secondary: "oklch(0.955 0.014 70)",
    "secondary-hover": "oklch(0.92 0.02 68)",
    "secondary-foreground": "oklch(0.33 0.035 50)",
    accent: "oklch(0.68 0.11 195)",
    "accent-hover": "oklch(0.62 0.11 195)",
    "accent-foreground": "oklch(0.2 0.04 200)",
    "accent-soft": "oklch(0.95 0.03 195)",
    "accent-soft-foreground": "oklch(0.42 0.08 200)",

    "shadow-color": "40 30% 20%",
  },
  products: {
    // Darker cream than the board, so white frames stand out.
    design: {
      "canvas-background": "oklch(0.92 0.02 68)",
      "canvas-grid": "oklch(0.84 0.028 65)",
    },
  },
  preview: {
    background: "oklch(0.985 0.008 75)",
    surface: "oklch(1 0 0)",
    primary: "oklch(0.64 0.19 45)",
    foreground: "oklch(0.27 0.03 50)",
  },
};
