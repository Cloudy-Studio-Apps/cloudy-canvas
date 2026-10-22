import {
  roundPoint,
  type CanvasPointer,
  type ElementGesture,
  type ElementPatch,
  type Point,
  type ToolContext,
} from "@canvas";

import { lineEnds, lineFromEnds, snapTo45 } from "./line-geometry";
import type { LineNodeElement } from "./line.types";

/**
 * Drags one end of a selected line, as one undo step; Shift keeps it at 45° steps from the other
 * end. Cancelling puts the line back.
 */
export class LineEndDrag implements ElementGesture {
  private started = false;

  constructor(
    private readonly ctx: ToolContext,
    private readonly origin: LineNodeElement,
    private readonly which: "start" | "end",
  ) {}

  move(p: CanvasPointer): void {
    if (!this.started) {
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    const { start, end } = lineEnds(this.origin);
    const fixed = this.which === "start" ? end : start;
    const moved = p.shiftKey ? snapTo45(fixed, p.world) : roundPoint(p.world);
    this.set(this.which === "start" ? moved : fixed, this.which === "start" ? fixed : moved);
  }

  finish(p: CanvasPointer): void {
    if (this.started) this.move(p);
  }

  cancel(): void {
    if (!this.started) return;
    const { start, end } = lineEnds(this.origin);
    this.set(start, end);
  }

  private set(start: Point, end: Point): void {
    this.ctx.doc.update(this.origin.id, lineFromEnds(start, end) as ElementPatch);
  }
}
