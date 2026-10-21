import { createId } from "@core";

import { STICKY_SIZE } from "../document";
import type { CanvasPointer, Tool, ToolContext } from "./types";

/** Click to drop a sticky note centered on the pointer, then type into it. */
export class StickyTool implements Tool {
  readonly id = "sticky" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const id = createId();
    this.ctx.doc.checkpoint();
    this.ctx.doc.add({
      id,
      type: "sticky",
      index: this.ctx.doc.nextIndex(),
      x: Math.round(p.world.x - STICKY_SIZE / 2),
      y: Math.round(p.world.y - STICKY_SIZE / 2),
      w: STICKY_SIZE,
      h: STICKY_SIZE,
      color: this.ctx.getOptions().stickyColor,
      text: "",
    });
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
    this.ctx.editText(id);
  }

  onPointerMove(): void {}
  onPointerUp(): void {}
}
