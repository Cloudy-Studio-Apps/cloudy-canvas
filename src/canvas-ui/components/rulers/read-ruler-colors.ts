import { resolveCssColor } from "@shared/ui/lib/css-color";

import type { RulerColors } from "./rulers.types";

/** The rulers' colors from the `--canvas-ruler*` tokens, as `element` sees them. */
export function readRulerColors(element: Element): RulerColors {
  const color = (variable: string, fallback: number) =>
    `#${resolveCssColor(variable, fallback, element).toString(16).padStart(6, "0")}`;
  return {
    background: color("--canvas-ruler", 0xffffff),
    foreground: color("--canvas-ruler-foreground", 0x6b7280),
    border: color("--canvas-ruler-border", 0xe5e7eb),
    selection: color("--canvas-selection", 0x4c9be0),
  };
}
