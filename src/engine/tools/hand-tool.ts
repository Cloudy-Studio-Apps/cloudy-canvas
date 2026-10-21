import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

export class HandTool implements Tool {
  readonly id = "hand" as const;
  readonly cursor = "grab";
  private last: CanvasPointer["screen"] | null = null;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    this.last = p.screen;
    this.ctx.setCursor("grabbing");
  }

  onPointerMove(p: CanvasPointer): void {
    if (!this.last) return;
    this.ctx.panBy(p.screen.x - this.last.x, p.screen.y - this.last.y);
    this.last = p.screen;
  }

  onPointerUp(): void {
    this.onCancel();
  }

  onCancel(): void {
    this.last = null;
    this.ctx.setCursor(this.cursor);
  }
}
