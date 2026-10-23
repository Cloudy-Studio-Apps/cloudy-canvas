import { CanvasTextMetrics, fontStringFromTextStyle, type Text } from "pixi.js";

/**
 * How far up to move a Pixi text so its lines sit where CSS (the text editor) and Figma put them.
 * When the line height is below the font's own height, they center each line's glyphs in it (a
 * negative half-leading: glyphs reach above and below the lines), while Pixi starts every line at
 * its top, so its lines sit lower. 0 otherwise.
 */
export function negativeHalfLeading(text: Text): number {
  const lineHeight = text.style.lineHeight;
  if (!lineHeight) return 0;
  const { fontSize } = CanvasTextMetrics.measureFont(fontStringFromTextStyle(text.style));
  return Math.min(0, (lineHeight - fontSize) / 2);
}
