import { selectAndEdit, type CanvasPointer, type Tool, type ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { createSticky } from "../elements";

/** Click to drop a sticky note centered on the pointer, then type into it. */
export class StickyTool implements Tool {
  readonly id = "sticky" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc } = this.ctx;
    const sticky = createSticky(p.world, this.ctx.getOptions().stickyColor, doc.nextIndex());
    doc.checkpoint();
    doc.add(sticky);
    selectAndEdit(this.ctx, sticky.id);
  }
}
