import { createTextDraft, TEXT_DEFAULTS, type TextElement } from "../../modules";
import { INK_COLOR } from "../../palette";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import { solidColor } from "./fig-paint-values";
import { nodeRect } from "./node-rect";
import { wrappedText } from "./wrapped-text";

/** A text: its lines as FigJam wrapped them, color and size. Empty texts are left out. */
export const convertText: FigJamNodeConverter = (node, placement) => {
  const text = wrappedText(node);
  if (!text.trim()) return;
  const color = solidColor(node.fillPaints) ?? INK_COLOR;
  const draft = createTextDraft({ x: 0, y: 0 }, color, node.fontSize ?? TEXT_DEFAULTS.fontSize);
  placement.ctx.place(node, draft.id);
  const el: TextElement = { ...draft, ...nodeRect(node, placement), text };
  placement.out.add(el);
};
