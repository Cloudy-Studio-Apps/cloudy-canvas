import {
  DRAW_THRESHOLD_PX,
  pastThreshold,
  rectFromPoints,
  roundPoint,
  selectAndEdit,
  type CanvasPointer,
  type Tool,
  type ToolContext,
} from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { parentFor } from "../core";
import { createText } from "./text.factory";
import type { TextNodeElement } from "./text.types";

/**
 * Types text (T): click to start an auto-width text, or drag to give it a fixed width (auto
 * height). Clicking a layer that has text edits it. The text is added when typing ends with
 * something typed, in the frame under it, and the select tool comes back.
 */
export class TextTool implements Tool {
  readonly id = "text";
  readonly cursor = "text";
  private start: CanvasPointer | null = null;

  constructor(private readonly ctx: ToolContext<DesignToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    const hit = this.ctx.elementAt(p.world);
    if (hit && this.ctx.kinds.kindOf(hit).text) {
      this.ctx.setTool("select");
      selectAndEdit(this.ctx, hit.id);
      return;
    }
    this.start = p;
  }

  onPointerUp(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    this.start = null;
    const { textTypography } = this.ctx.getOptions();
    const { doc } = this.ctx;
    const dragged = pastThreshold(start, p, DRAW_THRESHOLD_PX);
    const box = rectFromPoints(roundPoint(start.world), roundPoint(p.world));
    const draft = dragged
      ? createText(box, doc.nextIndex(), null, textTypography, Math.max(1, box.w))
      : createText(roundPoint(p.world), doc.nextIndex(), null, textTypography);
    this.ctx.setSelection([]);
    this.ctx.setTool("select");
    const text: TextNodeElement = { ...draft, parentId: parentFor(this.ctx, draft) };
    this.ctx.editNewText(text);
  }

  onCancel(): void {
    this.start = null;
  }
}
