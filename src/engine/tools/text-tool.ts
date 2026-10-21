import { createTextDraft, isEditableShape } from "../document";
import { selectAndEdit } from "./select-and-edit";
import type { CanvasPointer, Tool, ToolContext } from "./types";

/** Click to start typing; clicking existing text or a sticky edits it. */
export class TextTool implements Tool {
  readonly id = "text" as const;
  readonly cursor = "text";

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const hit = this.ctx.shapeAt(p.world);
    if (isEditableShape(hit)) {
      selectAndEdit(this.ctx, hit.id);
      return;
    }
    this.ctx.setSelection([]);
    this.ctx.setTool("select");
    this.ctx.editNewText(createTextDraft(p.world));
  }
}
