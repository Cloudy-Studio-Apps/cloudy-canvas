import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { createTable, TABLE_DEFAULTS } from "../elements";

/** Click to place an empty table centered on the pointer. */
export class TableTool implements Tool {
  readonly id = "table" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc } = this.ctx;
    const { tableColor, tableHeader } = this.ctx.getOptions();
    const { w, h } = TABLE_DEFAULTS.size;
    const at = { x: p.world.x - w / 2, y: p.world.y - h / 2 };
    const table = createTable(at, tableColor, tableHeader, doc.nextIndex());
    doc.checkpoint();
    doc.add(table);
    this.ctx.setSelection([table.id]);
    this.ctx.setTool("select");
  }
}
