import type { CanvasTheme } from "@engine";
import { resolveCssColor } from "@ui/lib/css-color";

/** Resolves the canvas theme tokens (see tokens.css) into the colors the engine draws with. */
export function readCanvasTheme(): CanvasTheme {
  return {
    background: resolveCssColor("--canvas-background", 0xfafafa),
    grid: resolveCssColor("--canvas-grid", 0xd4d7dc),
    selection: resolveCssColor("--canvas-selection", 0x4c9be0),
  };
}
