import { createSection } from "../../modules";
import { SECTION_COLORS } from "../../palette";
import type { FigJamNodeConverter } from "./convert-figjam-node.types";
import { solidColor } from "./fig-paint-values";
import { nodeRect } from "./node-rect";

/** A section: its title and color. What it holds is converted after it, on top of it. */
export const convertSection: FigJamNodeConverter = (node, placement) => {
  const color = solidColor(node.fillPaints) ?? SECTION_COLORS[0].value;
  const section = createSection(nodeRect(node, placement), node.name ?? "Section", color, "");
  placement.ctx.place(node, section.id, false);
  placement.out.add(section);
};
