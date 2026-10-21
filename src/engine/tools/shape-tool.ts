import { createGeo, GEO_VARIANTS, MIN_ELEMENT_SIZE, type GeoVariantId } from "../elements";
import { rectFromPoints } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";

const DRAG_THRESHOLD = 4; // screen px

/** Click to place a geo element of the chosen variant, or drag to draw it (Shift for equal sides). */
export class ShapeTool implements Tool {
  readonly id = "shape" as const;
  readonly cursor = "crosshair";
  private start: CanvasPointer | null = null;
  private elementId: string | null = null;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    this.ctx.setSelection([]);
    this.start = p;
    this.elementId = null;
  }

  onPointerMove(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    if (!this.elementId) {
      const distance = Math.hypot(p.screen.x - start.screen.x, p.screen.y - start.screen.y);
      if (distance < DRAG_THRESHOLD) return;
      this.elementId = this.add(dragRect(start.world, p.world, p.shiftKey));
      return;
    }
    this.ctx.doc.update(this.elementId, dragRect(start.world, p.world, p.shiftKey));
  }

  onPointerUp(p: CanvasPointer): void {
    const start = this.start;
    if (!start) return;
    const id = this.elementId ?? this.add(clickRect(p.world, this.ctx.getOptions().shapeKind));
    this.start = null;
    this.elementId = null;
    this.ctx.setSelection([id]);
    this.ctx.setTool("select");
  }

  onCancel(): void {
    this.start = null;
    this.elementId = null;
  }

  private add(rect: Rect): string {
    const { doc } = this.ctx;
    const { shapeKind, shapeFill, shapeStroke } = this.ctx.getOptions();
    const geo = createGeo(rect, shapeKind, shapeFill, shapeStroke, doc.nextIndex());
    doc.checkpoint();
    doc.add(geo);
    return geo.id;
  }
}

function clickRect(center: Point, kind: GeoVariantId): Rect {
  const { w, h } = GEO_VARIANTS[kind].defaultSize;
  return { x: center.x - w / 2, y: center.y - h / 2, w, h };
}

function dragRect(a: Point, b: Point, square: boolean): Rect {
  let end = b;
  if (square) {
    const size = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    end = { x: a.x + Math.sign(b.x - a.x || 1) * size, y: a.y + Math.sign(b.y - a.y || 1) * size };
  }
  const rect = rectFromPoints(a, end);
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(Math.max(MIN_ELEMENT_SIZE, rect.w)),
    h: Math.round(Math.max(MIN_ELEMENT_SIZE, rect.h)),
  };
}
