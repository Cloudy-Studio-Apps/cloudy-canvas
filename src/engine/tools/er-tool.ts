import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

/** Click to place an ER entity centered on the pointer; it's selected so the ER editor opens. */
export class ErTool implements Tool {
  readonly id = "er" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const id = this.ctx.er.addEntity(p.world);
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }
}
