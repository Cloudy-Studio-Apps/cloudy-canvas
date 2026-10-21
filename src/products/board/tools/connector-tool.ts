import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { connectableAt, ConnectorDrag } from "../elements";

/** Drag from a shape (or empty canvas) to another shape to connect them. */
export class ConnectorTool implements Tool {
  readonly id = "connector" as const;
  readonly cursor = "crosshair";
  private drag: ConnectorDrag | null = null;

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    const el = connectableAt(this.ctx, p.world);
    const start = {
      shapeId: el?.id ?? null,
      side: null,
      x: Math.round(p.world.x),
      y: Math.round(p.world.y),
    };
    this.drag = new ConnectorDrag(this.ctx, { kind: "new", start }, p);
  }

  onPointerMove(p: CanvasPointer): void {
    this.drag?.move(p);
  }

  onPointerUp(): void {
    const drag = this.drag;
    this.drag = null;
    drag?.finish();
    if (drag?.changed) this.ctx.setTool("select");
  }

  onHover(p: CanvasPointer): void {
    this.ctx.setHover(connectableAt(this.ctx, p.world)?.id ?? null);
  }

  onCameraChange(): void {
    this.drag?.onCameraChange();
  }

  onCancel(): void {
    this.drag?.cancel();
    this.drag = null;
    this.ctx.setHover(null);
  }
}
