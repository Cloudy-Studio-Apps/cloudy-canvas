import { createSticky, type StickyElement } from "../../modules";
import { STICKY_COLORS } from "../../palette";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import { solidColor } from "./fig-paint-values";
import { BODY_PART, generatedPart, generatedText } from "./generated-parts";
import { nodeRect } from "./node-rect";

/** A sticky note: its color, text and size. */
export const convertSticky: FigJamNodeConverter = (node, placement) => {
  const rect = nodeRect(node, placement);
  const color = solidColor(generatedPart(node, BODY_PART)?.fillPaints);
  const sticky = createSticky({ x: 0, y: 0 }, color ?? STICKY_COLORS[0].value, "");
  placement.ctx.place(node, sticky.id);
  const el: StickyElement = { ...sticky, ...rect, text: generatedText(node) };
  placement.out.add(el);
};
