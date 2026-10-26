import { TokenStore } from "@canvas";
import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { TABLE_DEFAULTS } from "./table.defaults";
import { createTable } from "./table.factory";
import { newColorBindings } from "../../tokens";

/** Click to place an empty table centered on the pointer. */
export class TableTool implements Tool {
  readonly id = "table" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc } = this.ctx;
    const options = this.ctx.getOptions();
    const { tableColor, tableHeader } = options;
    const { w, h } = TABLE_DEFAULTS.size;
    const at = { x: p.world.x - w / 2, y: p.world.y - h / 2 };
    const table = {
      ...createTable(at, tableColor, tableHeader, doc.nextIndex()),
      ...newColorBindings(options, TABLE_DEFAULTS.colorOptions, TokenStore.of(this.ctx.doc)),
    };
    doc.checkpoint();
    doc.add(table);
    this.ctx.setSelection([table.id]);
    this.ctx.setTool("select");
  }
}
