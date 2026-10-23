import { CanvasTextMetrics } from "pixi.js";

import { cssFont } from "../text-font";
import type { TextFont } from "../text-font.types";

/** Bumped each time a font loads (text measures differently from then on). */
let version = 0;

/** How far a font's glyphs reach above and below its baseline, at its size. */
export function fontMetrics(font: TextFont): { ascent: number; descent: number } {
  const { ascent, descent } = CanvasTextMetrics.measureFont(cssFont(font));
  return { ascent, descent };
}

/**
 * A font has loaded: metrics measured with its fallback are dropped, and layouts cached by
 * `fontsVersion` are worked out again.
 */
export function fontsChanged(): void {
  version++;
  CanvasTextMetrics.clearMetrics();
}

/** Changes whenever a font loads; caches of laid-out text include it in their keys. */
export function fontsVersion(): number {
  return version;
}
