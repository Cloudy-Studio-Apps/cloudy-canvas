import type { BrochureSettings } from "../../brochure";
import type { BookLayout } from "../book-layout.types";
import type { ArrangeBlock } from "./arrange.types";

/**
 * The brochure's spreads as blocks to lay out (see `ArrangeBlock`): in the book layout, a side
 * lies left of the spine when `(i + offset)` is even; half of a spread frame puts its page across
 * the spine; blank sides add nothing. A page is placed once, in the first block it shows in.
 */
export function arrangeBlocks(layout: BookLayout, settings: BrochureSettings): ArrangeBlock[] {
  const placed = new Set<string>();
  const blocks: ArrangeBlock[] = [];
  for (const spread of layout.spreads) {
    const block: ArrangeBlock = {};
    for (const i of spread) {
      const side = layout.sides[i];
      if (side?.kind !== "page" || placed.has(side.page.slot.id)) continue;
      placed.add(side.page.slot.id);
      if (side.part !== "whole") block.across = side.page;
      else if (settings.layout === "book" && (i + layout.offset) % 2 === 0) block.left = side.page;
      else block.right = side.page;
    }
    if (block.left || block.right || block.across) blocks.push(block);
  }
  return blocks;
}
