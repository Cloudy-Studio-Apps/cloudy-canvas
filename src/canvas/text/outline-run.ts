import type { FontRequest, GlyphOutliner } from "@shared/core";

import type { PathContour } from "../path";
import type { OutlineRunPlace, OutlinedRun } from "./outline-run.types";

/**
 * A run of text shaped in one face, as outlines placed on its baseline from `x`, each glyph moved
 * on by its letter spacing. `null` while the face is being read (or can't be).
 */
export function outlineRun(
  outliner: GlyphOutliner,
  font: FontRequest,
  text: string,
  size: number,
  { letterSpacing, x, baseline }: OutlineRunPlace,
): OutlinedRun | null {
  const run = outliner.shape(font, text, size);
  if (!run) return null;
  const contours: PathContour[] = [];
  let pen = x;
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
    pen += glyph.advance + letterSpacing;
  }
  return { contours, advance: pen - x };
}
