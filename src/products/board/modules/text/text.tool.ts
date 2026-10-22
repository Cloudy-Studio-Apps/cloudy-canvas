import { selectAndEdit, type CanvasPointer, type Tool, type ToolContext } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { TEXT_DEFAULTS } from "./text.defaults";
import { createTextDraft } from "./text.factory";
import { INK_COLOR } from "../../palette";

/** Click to start typing; clicking an element with text (a sticky, a shape, …) edits it. */
export class TextTool implements Tool {
  readonly id = "text" as const;
  readonly cursor = "text";

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const hit = this.ctx.elementAt(p.world);
    if (hit && this.ctx.kinds.kindOf(hit).text) {
      selectAndEdit(this.ctx, hit.id);
      return;
    }
    this.ctx.setSelection([]);
    this.ctx.setTool("select");
    this.ctx.editNewText(createTextDraft(p.world, INK_COLOR, TEXT_DEFAULTS.fontSize));
  }
}
