import {
  rectFromPoints,
  type CanvasPointer,
  type Rect,
  type Tool,
  type ToolContext,
} from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { isSection } from "./is-section";
import { SECTION_DEFAULTS } from "./section.defaults";
import { createSection } from "./section.factory";

const DRAG_THRESHOLD = 4; // screen px

/** Drag to draw a section around elements (they join it), or click to place an empty one. */
export class SectionTool implements Tool {
  readonly id = "section" as const;
  readonly cursor = "crosshair";
  private start: CanvasPointer | null = null;
  private elementId: string | null = null;

  constructor(private readonly ctx: ToolContext<BoardToolOptions>) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.start = p;
    this.elementId = null;
  }

  onPointerMove(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    const rect = dragRect(rectFromPoints(start.world, p.world));
    if (this.elementId) {
      this.ctx.doc.update(this.elementId, rect);
      return;
    }
    const distance = Math.hypot(p.screen.x - start.screen.x, p.screen.y - start.screen.y);
    if (distance >= DRAG_THRESHOLD) this.elementId = this.add(rect);
  }

  onPointerUp(p: CanvasPointer): void {
    if (!this.start) return;
    const { w, h } = SECTION_DEFAULTS.size;
    const id = this.elementId ?? this.add({ x: p.world.x - w / 2, y: p.world.y - h / 2, w, h });
    this.onCancel();
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }

  onCancel(): void {
    this.start = null;
    this.elementId = null;
  }

  private add(rect: Rect): string {
    const { doc } = this.ctx;
    const count = doc.all().filter(isSection).length;
    const section = createSection(
      rect,
      `Section ${count + 1}`,
      this.ctx.getOptions().sectionColor,
      doc.nextIndex(),
    );
    doc.checkpoint();
    doc.add(section);
    return section.id;
  }
}

function dragRect(rect: Rect): Rect {
  const { minSize } = SECTION_DEFAULTS;
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(Math.max(minSize, rect.w)),
    h: Math.round(Math.max(minSize, rect.h)),
  };
}
