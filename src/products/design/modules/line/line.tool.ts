import type { CanvasPointer, Point, Tool, ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../design-options.types";
import { containerAt, nextLayerName } from "../core";
import { createLine } from "./line.factory";
import { LINE_DEFAULTS } from "./line.defaults";
import { lineFromEnds, snapTo45 } from "./line-geometry";
import type { LineCap } from "./line.types";

const DRAG_THRESHOLD = 4; // screen px

/**
 * Draws a line (or an arrow, with an `arrow` end cap): drag from start to end, Shift for 45°
 * steps, or click for a horizontal one. It goes into the frame under its middle, is selected, and
 * the select tool comes back.
 */
export class LineTool implements Tool {
  readonly cursor = "crosshair";
  private start: CanvasPointer | null = null;
  private lineId: string | null = null;

  constructor(
    private readonly ctx: ToolContext<DesignToolOptions>,
    readonly id: string,
    private readonly endCap: LineCap,
    private readonly layerName: string,
  ) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.start = p;
    this.lineId = null;
  }

  onPointerMove(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    const from = roundPoint(start.world);
    const to = p.shiftKey ? snapTo45(from, p.world) : roundPoint(p.world);
    if (this.lineId) return this.ctx.doc.update(this.lineId, lineFromEnds(from, to));
    const distance = Math.hypot(p.screen.x - start.screen.x, p.screen.y - start.screen.y);
    if (distance >= DRAG_THRESHOLD) this.lineId = this.add(from, to);
  }

  onPointerUp(p: CanvasPointer): void {
    if (!this.start) return;
    const from = roundPoint(p.world);
    const id = this.lineId ?? this.add(from, { x: from.x + LINE_DEFAULTS.size.w, y: from.y });
    this.start = null;
    this.lineId = null;
    this.placeInContainer(id);
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }

  onCancel(): void {
    this.start = null;
    this.lineId = null;
  }

  private add(from: Point, to: Point): string {
    const { doc } = this.ctx;
    const name = nextLayerName(doc.all(), this.layerName);
    const line = createLine(from, to, name, doc.nextIndex(), null, this.endCap);
    doc.checkpoint();
    doc.add(line);
    return line.id;
  }

  /** Puts the finished line into the frame under its middle (in the same undo step). */
  private placeInContainer(id: string): void {
    const line = this.ctx.getElement(id);
    if (!line) return;
    const probe = { x: line.x + line.w / 2, y: line.y + line.h / 2, w: 0, h: 0 };
    const under = this.ctx.elementsInRect(probe);
    const parentId = containerAt(line, under, this.ctx.kinds, new Set([id]))?.id ?? null;
    if (parentId) this.ctx.doc.update(id, { parentId } as Partial<typeof line>);
  }
}

function roundPoint({ x, y }: Point): Point {
  return { x: Math.round(x), y: Math.round(y) };
}
