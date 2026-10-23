import type { FigNode } from "./fig-node.types";
import type { FigTree } from "./fig-tree.types";

/** The fields a text style sets (what Figma draws with, whatever the node itself stores). */
const TEXT_STYLE_FIELDS = [
  "fontName",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "textCase",
  "textDecoration",
  "paragraphSpacing",
] as const satisfies readonly (keyof FigNode)[];

/**
 * `node` with the shared styles it uses applied: a text style's typography, a color style's fill
 * and stroke paints. A styled node can keep stale values of its own (files written by plugins
 * do), so the style wins, as when Figma draws it. Styles missing from the file change nothing.
 */
export function withFigStyles(tree: FigTree, node: FigNode): FigNode {
  let styled = node;
  const text = tree.style(node.styleIdForText);
  if (text) {
    const fields: Partial<FigNode> = {};
    for (const field of TEXT_STYLE_FIELDS) {
      if (text[field] !== undefined) Object.assign(fields, { [field]: text[field] });
    }
    styled = { ...styled, ...fields };
  }
  const fill = tree.style(node.styleIdForFill);
  if (fill?.fillPaints) styled = { ...styled, fillPaints: fill.fillPaints };
  const stroke = tree.style(node.styleIdForStrokeFill);
  if (stroke?.fillPaints) styled = { ...styled, strokePaints: stroke.fillPaints };
  return styled;
}
