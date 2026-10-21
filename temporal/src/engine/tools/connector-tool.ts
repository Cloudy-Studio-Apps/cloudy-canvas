import { ConnectorDrag } from "./connector-drag";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

/** Drag from a shape (or empty canvas) to another shape to connect them. */
export class ConnectorTool implements Tool {
  readonly id = "connector" as const;
  readonly cursor = "crosshair";
  private drag: ConnectorDrag | null = null;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    const shape = this.ctx.connectableAt(p.world);
    const start = {
      shapeId: shape?.id ?? null,
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
    const created = this.drag?.finish() ?? false;
    this.drag = null;
    if (created) this.ctx.setTool("select");
  }

  onHover(p: CanvasPointer): void {
    this.ctx.setHover(this.ctx.connectableAt(p.world)?.id ?? null);
  }

  onCameraChange(): void {
    this.drag?.update();
  }

  onCancel(): void {
    this.drag?.cancel();
    this.drag = null;
    this.ctx.setHover(null);
  }
}
