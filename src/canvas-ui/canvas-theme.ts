import type { CanvasTheme } from "@canvas";
import { resolveCssColor } from "@shared/ui/lib/css-color";

/** Resolves the canvas theme tokens (see tokens.css) into the colors the engine draws with. */
export function readCanvasTheme(): CanvasTheme {
  return {
    background: resolveCssColor("--canvas-background", 0xfafafa),
    grid: resolveCssColor("--canvas-grid", 0xd4d7dc),
    selection: resolveCssColor("--canvas-selection", 0x4c9be0),
    relation: resolveCssColor("--canvas-relation", 0x7a8494),
  };
}
