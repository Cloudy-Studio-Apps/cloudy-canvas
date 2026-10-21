import { createId } from "@core";

import { INK_COLOR, LINE_HEIGHT, TEXT_FONT_SIZE } from "../document";
import type { CanvasPointer, Tool, ToolContext } from "./types";

/** Click to start typing; clicking existing text edits it. */
export class TextTool implements Tool {
  readonly id = "text" as const;
  readonly cursor = "text";

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const hit = this.ctx.shapeAt(p.world);
    if (hit && (hit.type === "text" || hit.type === "sticky")) {
      this.ctx.setSelection([hit.id]);
      this.ctx.setTool("select");
      this.ctx.editText(hit.id);
      return;
    }

    const lineHeight = TEXT_FONT_SIZE * LINE_HEIGHT;
    this.ctx.setSelection([]);
    this.ctx.setTool("select");
    this.ctx.editNewText({
      id: createId(),
      type: "text",
      index: "", // assigned when the draft is committed
      x: Math.round(p.world.x),
      y: Math.round(p.world.y - lineHeight / 2),
      w: 2,
      h: Math.ceil(lineHeight),
      color: INK_COLOR,
      fontSize: TEXT_FONT_SIZE,
      text: "",
    });
  }

  onPointerMove(): void {}
  onPointerUp(): void {}
}
