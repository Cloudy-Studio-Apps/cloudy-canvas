import {
  createSectionShape,
  isSection,
  MIN_SHAPE_SIZE,
  SECTION_DEFAULT_H,
  SECTION_DEFAULT_W,
} from "../document";
import { rectFromPoints } from "../geometry";
import type { Rect } from "../geometry.types";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

const DRAG_THRESHOLD = 4; // screen px

/** Drag to draw a section around shapes (they join it), or click to place an empty one. */
export class SectionTool implements Tool {
  readonly id = "section" as const;
  readonly cursor = "crosshair";
  private start: CanvasPointer | null = null;
  private sectionId: string | null = null;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.start = p;
    this.sectionId = null;
  }

  onPointerMove(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    const rect = sizedRect(rectFromPoints(start.world, p.world));
    if (this.sectionId) {
      this.ctx.doc.update(this.sectionId, rect);
      return;
    }
    const distance = Math.hypot(p.screen.x - start.screen.x, p.screen.y - start.screen.y);
    if (distance >= DRAG_THRESHOLD) this.sectionId = this.add(rect);
  }

  onPointerUp(p: CanvasPointer): void {
    if (!this.start) return;
    const id =
      this.sectionId ??
      this.add({
        x: p.world.x - SECTION_DEFAULT_W / 2,
        y: p.world.y - SECTION_DEFAULT_H / 2,
        w: SECTION_DEFAULT_W,
        h: SECTION_DEFAULT_H,
      });
    this.onCancel();
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }

  onCancel(): void {
    this.start = null;
    this.sectionId = null;
  }

  private add(rect: Rect): string {
    const { doc } = this.ctx;
    const count = doc.all().filter(isSection).length;
    const section = createSectionShape(
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

function sizedRect(rect: Rect): Rect {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(Math.max(MIN_SHAPE_SIZE * 4, rect.w)),
    h: Math.round(Math.max(MIN_SHAPE_SIZE * 4, rect.h)),
  };
}
