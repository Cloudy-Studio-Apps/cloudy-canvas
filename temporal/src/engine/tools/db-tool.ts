import { createDbEnum, createDbTable } from "../db";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

/** Click to place a database table (or enum) centered on the pointer; it's selected so its editor opens. */
export class DbTool implements Tool {
  readonly id = "db" as const;
  readonly cursor = "crosshair";

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const { doc, db } = this.ctx;
    const shape =
      this.ctx.getOptions().dbKind === "enum"
        ? createDbEnum(p.world, db.uniqueName("status", "enum"), doc.nextIndex())
        : createDbTable(p.world, db.uniqueName(), doc.nextIndex());
    doc.checkpoint();
    doc.add(shape);
    this.ctx.setSelection([shape.id]);
    this.ctx.setTool("select");
  }
}
