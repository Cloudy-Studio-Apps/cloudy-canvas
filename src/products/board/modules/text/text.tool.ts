import {
  selectAndEdit,
  TokenStore,
  type CanvasPointer,
  type Tool,
  type ToolContext,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { newColorBindings } from "../../tokens";
import { TEXT_DEFAULTS } from "./text.defaults";
import { createTextDraft } from "./text.factory";
import { clampFontSize, textLookOf } from "./text-options";

/**
 * Click to start typing, in the panel's size, color and style; clicking an element with text (a
 * sticky, a shape, …) edits it.
 */
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
    const options = this.ctx.getOptions();
    const draft = {
      ...createTextDraft(
        p.world,
        options.textColor,
        clampFontSize(options.textSize),
        textLookOf(options),
      ),
      ...newColorBindings(options, TEXT_DEFAULTS.colorOptions, TokenStore.of(this.ctx.doc)),
    };
    this.ctx.setSelection([]);
    this.ctx.setTool("select");
    this.ctx.editNewText(draft);
  }
}
