import type { CanvasTheme } from "@canvas";
import { resolveCssColor } from "@shared/ui/lib/css-color";

/**
 * Resolves the canvas theme tokens (see tokens.css) into the colors the engine draws with, as
 * `element` sees them: a product's editor can override them (e.g. `[data-product="design"]`).
 */
export function readCanvasTheme(element?: Element): CanvasTheme {
  return {
    background: resolveCssColor("--canvas-background", 0xfafafa, element),
    grid: resolveCssColor("--canvas-grid", 0xd4d7dc, element),
    selection: resolveCssColor("--canvas-selection", 0x4c9be0, element),
    snap: resolveCssColor("--canvas-snap", 0xe5484d, element),
    relation: resolveCssColor("--canvas-relation", 0x7a8494, element),
  };
}
