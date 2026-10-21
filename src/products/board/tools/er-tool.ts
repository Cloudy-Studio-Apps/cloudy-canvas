import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { ErModel } from "../elements";

/**
 * Click to start a new ER diagram with an entity centered on the pointer; it's selected so the
 * ER editor opens.
 */
export class ErTool implements Tool {
  readonly id = "er" as const;
  readonly cursor = "crosshair";
  private readonly er: ErModel;

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {
    this.er = new ErModel(ctx.doc);
  }

  onPointerDown(p: CanvasPointer): void {
    const id = this.er.newDiagram(p.world);
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }
}
