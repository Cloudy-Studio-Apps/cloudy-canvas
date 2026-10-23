import { measureTextBlock, type PathContour, type PathShape } from "@canvas";
import type { FontRequest, GlyphOutliner, ShapedLine } from "@shared/core";

import { fontOf } from "./text-layout";
import type { TextNodeElement } from "./text.types";

/**
 * A text's glyphs as outlines in its own frame, laid out as it's drawn: its lines (wrapped to its
 * width), aligned in its box, each on its baseline, with its letter spacing. `null` while its
 * face is still being read (or can't be).
 */
export function textOutline(el: TextNodeElement, outliner: GlyphOutliner): PathShape | null {
  const font = fontOf(el);
  const request: FontRequest = {
    family: el.fontFamily,
    weight: el.fontWeight,
    style: el.fontStyle,
  };
  const { lines } = measureTextBlock(el.text, font, el.autoResize === "width" ? undefined : el.w);
  const shaped: ShapedLine[] = [];
  for (const line of lines) {
    const run = outliner.shape(request, line, el.fontSize);
    if (!run) return null;
    shaped.push(run);
  }
  const widths = shaped.map(
    (run) => run.glyphs.reduce((w, g) => w + g.advance, 0) + el.letterSpacing * run.glyphs.length,
  );
  const blockW = Math.max(0, ...widths);
  const lineHeight = el.fontSize * el.lineHeight;
  const blockH = lines.length * lineHeight;
  const blockX =
    el.textAlign === "center" ? (el.w - blockW) / 2 : el.textAlign === "right" ? el.w - blockW : 0;
  const blockY =
    el.verticalAlign === "middle"
      ? (el.h - blockH) / 2
      : el.verticalAlign === "bottom"
        ? el.h - blockH
        : 0;

  const contours: PathContour[] = [];
  shaped.forEach((run, j) => {
    const width = widths[j]!;
    const offset =
      el.textAlign === "center"
        ? (blockW - width) / 2
        : el.textAlign === "right"
          ? blockW - width
          : 0;
    // As the canvas and the editor draw a line: centered in the line's height, reaching past it
    // when the line is tighter than the font (as in CSS and Figma).
    const extent = run.ascent + run.descent;
    const shift = (lineHeight - extent) / 2;
    const baseline = blockY + j * lineHeight + run.ascent + shift;
    let pen = blockX + offset;
    for (const glyph of run.glyphs) {
      const dx = pen;
      for (const contour of glyph.contours) {
        const move = (p: { x: number; y: number }) => ({ x: p.x + dx, y: p.y + baseline });
        contours.push({
          start: move(contour.start),
          segments: contour.segments.map(({ c1, c2, to }) => ({
            c1: move(c1),
            c2: move(c2),
            to: move(to),
          })),
          closed: contour.closed,
        });
      }
      pen += glyph.advance + el.letterSpacing;
    }
  });
  return { contours };
}
