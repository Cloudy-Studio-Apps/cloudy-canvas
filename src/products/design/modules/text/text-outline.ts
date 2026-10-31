import {
  decorationRect,
  outlineRun,
  rectPath,
  runStyleAt,
  type PathContour,
  type PathShape,
} from "@canvas";
import type { FontRequest, GlyphOutliner } from "@shared/core";

import { textLayout } from "./text-layout";
import { baseRunStyle } from "./text-spans";
import type { TextNodeElement } from "./text.types";

/**
 * A text's glyphs as outlines in its own frame, laid out as it's drawn (`textLayout`): each
 * fragment shaped in its run's face at its place on its line's baseline, with its letter
 * spacing, and its underline or strikethrough. `null` while a face it uses is still being read
 * (or can't be).
 */
export function textOutline(el: TextNodeElement, outliner: GlyphOutliner): PathShape | null {
  const layout = textLayout(el);
  const base = baseRunStyle(el);
  const contours: PathContour[] = [];
  // Every face is asked for (each starts loading), though one missing leaves the text shapeless.
  let missing = false;
  for (const line of layout.lines) {
    for (const fragment of line.fragments) {
      const decoration = decorationRect(layout, line, fragment);
      if (decoration) contours.push(...rectPath(decoration, 0).contours);
      if (fragment.space) continue;
      const style = { ...base, ...runStyleAt(el.runs, fragment.start) };
      const request: FontRequest = {
        family: style.fontFamily,
        weight: style.fontWeight,
        style: style.fontStyle,
      };
      const text = layout.text.slice(fragment.start, fragment.end);
      const run = outlineRun(outliner, request, text, style.fontSize, {
        letterSpacing: style.letterSpacing,
        x: fragment.x,
        baseline: line.baseline,
      });
      if (run) contours.push(...run.contours);
      else missing = true;
    }
  }
  return missing ? null : { contours };
}
