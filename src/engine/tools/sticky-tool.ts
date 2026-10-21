import { createStickyShape } from "../document";
import { selectAndEdit } from "./select-and-edit";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

/** Click to drop a sticky note centered on the pointer, then type into it. */
export class StickyTool implements Tool {
  readonly id = "sticky" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc } = this.ctx;
    const shape = createStickyShape(p.world, this.ctx.getOptions().stickyColor, doc.nextIndex());
    doc.checkpoint();
    doc.add(shape);
    selectAndEdit(this.ctx, shape.id);
  }
}
