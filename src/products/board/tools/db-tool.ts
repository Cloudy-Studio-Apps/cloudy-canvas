import type { CanvasPointer, Tool, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { createDbEnum, createDbTable, freeName, isDbEnum, isDbTable } from "../elements";

/** Click to place a database table (or enum) centered on the pointer; it's selected so its editor opens. */
export class DbTool implements Tool {
  readonly id = "db" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc } = this.ctx;
    const all = doc.all();
    const el =
      this.ctx.getOptions().dbKind === "enum"
        ? createDbEnum(p.world, freeName(all.filter(isDbEnum), "status"), doc.nextIndex())
        : createDbTable(p.world, freeName(all.filter(isDbTable), "table"), doc.nextIndex());
    doc.checkpoint();
    doc.add(el);
    this.ctx.setSelection([el.id]);
    this.ctx.setTool("select");
  }
}
