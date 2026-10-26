import { normalizeRuns } from "@canvas";
import type { FigImportContext, FigNode, FigTextOverride } from "@canvas/figma";

import type { TextNodeRun, TextRunStyle } from "../../modules";
import { convertPaints } from "./fig-paints";
import { decorationOf, faceOf, letterSpacingOf, lineHeightOf } from "./fig-typography";

/**
 * A text's mixed styles as runs: characters grouped by their style id (`characterStyleIDs`),
 * each group but the node's own (id 0) styled by its entry of the `styleOverrideTable` (font,
 * size, line height, spacing, fills, decoration). A range's own case is left out, counted.
 */
export function figTextRuns(node: FigNode, length: number, ctx: FigImportContext): TextNodeRun[] {
  const ids = node.textData?.characterStyleIDs ?? [];
  const table = new Map<number, FigTextOverride>();
  for (const entry of node.textData?.styleOverrideTable ?? []) {
    if (entry.styleID !== undefined) table.set(entry.styleID, entry);
  }
  if (table.size === 0) return [];
  const styles = new Map<number, TextRunStyle>();
  const runs: TextNodeRun[] = [];
  let start = 0;
  for (let i = 1; i <= length; i++) {
    const id = ids[start] ?? 0;
    if (i < length && (ids[i] ?? 0) === id) continue;
    const entry = table.get(id);
    if (id !== 0 && entry) {
      let style = styles.get(id);
      if (!style) {
        style = runStyleOf(entry, node, ctx);
        styles.set(id, style);
      }
      runs.push({ start, end: i, style });
    }
    start = i;
  }
  return normalizeRuns(runs, length);
}

/** What one mixed style sets over the text's own fields. */
function runStyleOf(entry: FigTextOverride, node: FigNode, ctx: FigImportContext): TextRunStyle {
  const style: TextRunStyle = {};
  const fontSize = entry.fontSize ?? node.fontSize;
  if (entry.fontName) Object.assign(style, faceOf(entry.fontName));
  if (entry.fontSize !== undefined) style.fontSize = entry.fontSize;
  if (entry.lineHeight && fontSize !== undefined) {
    style.lineHeight = lineHeightOf(entry.lineHeight, fontSize);
  }
  if (entry.letterSpacing && fontSize !== undefined) {
    style.letterSpacing = letterSpacingOf(entry.letterSpacing, fontSize);
  }
  if (entry.fillPaints) style.fills = convertPaints(entry.fillPaints, ctx, false);
  if (entry.textDecoration !== undefined) style.textDecoration = decorationOf(entry.textDecoration);
  const textStyle = ctx.styleId(entry.styleIdForText);
  if (textStyle) style.textStyle = textStyle;
  if (entry.textCase !== undefined && entry.textCase !== node.textCase) {
    ctx.warnings.add("texts' case per range was left out");
  }
  return style;
}
