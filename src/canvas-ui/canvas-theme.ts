import type { CanvasTheme } from "@canvas";
import { resolveCssColor } from "@shared/ui/lib/css-color";

/**
 * Resolves the canvas theme tokens (see tokens.css) into the colors the engine draws with, as
 * `element` sees them: a product's editor can override them (e.g. `[data-product="design"]`).
 */
export function readCanvasTheme(element?: Element): CanvasTheme {
  return readTheme(element);
}

/**
 * The class of an element that shows the base theme whatever theme the app is in: the colors
 * exports and thumbnails are drawn with, so files don't depend on the user's theme.
 */
export const EXPORT_THEME_SCOPE = "theme-export-scope";

/** The canvas colors exports use, as `element`'s product would show them in the base theme. */
export function readExportCanvasTheme(element?: Element): CanvasTheme {
  const probe = document.createElement("div");
  probe.className = EXPORT_THEME_SCOPE;
  probe.hidden = true;
  const product = element?.closest("[data-product]")?.getAttribute("data-product");
  if (product) probe.dataset.product = product;
  document.body.appendChild(probe);
  try {
    return readTheme(probe);
  } finally {
    probe.remove();
  }
}

function readTheme(element?: Element): CanvasTheme {
  return {
    background: resolveCssColor("--canvas-background", 0xfafafa, element),
    grid: resolveCssColor("--canvas-grid", 0xd4d7dc, element),
    selection: resolveCssColor("--canvas-selection", 0x4c9be0, element),
    snap: resolveCssColor("--canvas-snap", 0xe5484d, element),
    relation: resolveCssColor("--canvas-relation", 0x7a8494, element),
  };
}
