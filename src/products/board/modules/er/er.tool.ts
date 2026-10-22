import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { ER_MODEL } from "./model";

/**
 * Click to start a new ER diagram with an entity centered on the pointer; it's selected so the
 * ER editor opens.
 */
export class ErTool implements Tool {
  readonly id = "er" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const id = this.ctx.service(ER_MODEL).newDiagram(p.world);
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }
}
