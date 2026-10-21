import { createDbTable } from "../db";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

/** Click to place a database table centered on the pointer; it's selected so the editor opens. */
export class DbTool implements Tool {
  readonly id = "db" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc, db } = this.ctx;
    const table = createDbTable(p.world, db.uniqueName(), doc.nextIndex());
    doc.checkpoint();
    doc.add(table);
    this.ctx.setSelection([table.id]);
    this.ctx.setTool("select");
  }
}
