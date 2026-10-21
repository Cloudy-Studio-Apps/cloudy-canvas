import type { ShapePatch } from "../document";
import { rectFromPoints, type Point } from "../geometry";
import type { CanvasPointer, Tool, ToolContext } from "./types";

const DRAG_THRESHOLD = 3; // screen px

type Gesture =
  | {
      kind: "move";
      start: CanvasPointer;
      origins: Map<string, Point>;
      started: boolean;
      /** Shift-click on an already selected shape deselects it — unless it turns into a drag. */
      toggleOnClick: string | null;
    }
  | { kind: "marquee"; start: CanvasPointer; base: Set<string> };

export class SelectTool implements Tool {
  readonly id = "select" as const;
  readonly cursor = "default";
  private gesture: Gesture | null = null;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const hit = this.ctx.shapeAt(p.world);
    this.ctx.setHover(null);

    if (!hit) {
      const base = p.shiftKey ? new Set(this.ctx.getSelection()) : new Set<string>();
      if (!p.shiftKey) this.ctx.setSelection([]);
      this.gesture = { kind: "marquee", start: p, base };
      return;
    }

    let toggleOnClick: string | null = null;
    if (p.shiftKey) {
      if (this.ctx.getSelection().has(hit.id)) toggleOnClick = hit.id;
      else this.ctx.setSelection([...this.ctx.getSelection(), hit.id]);
    } else if (!this.ctx.getSelection().has(hit.id)) {
      this.ctx.setSelection([hit.id]);
    }

    const origins = new Map<string, Point>();
    for (const id of this.ctx.getSelection()) {
      const shape = this.ctx.doc.get(id);
      if (shape) origins.set(id, { x: shape.x, y: shape.y });
    }
    this.gesture = { kind: "move", start: p, origins, started: false, toggleOnClick };
  }

  onPointerMove(p: CanvasPointer): void {
    const g = this.gesture;
    if (!g) return;

    if (g.kind === "marquee") {
      const rect = rectFromPoints(g.start.world, p.world);
      this.ctx.setMarquee(rect);
      const hits = this.ctx.shapesInRect(rect).map((shape) => shape.id);
      this.ctx.setSelection(new Set([...g.base, ...hits]));
      return;
    }

    if (!g.started) {
      const distance = Math.hypot(p.screen.x - g.start.screen.x, p.screen.y - g.start.screen.y);
      if (distance < DRAG_THRESHOLD) return;
      g.started = true;
      this.ctx.setCursor("move");
      this.ctx.doc.checkpoint();
    }

    const dx = p.world.x - g.start.world.x;
    const dy = p.world.y - g.start.world.y;
    const patches = new Map<string, ShapePatch>();
    for (const [id, origin] of g.origins) {
      patches.set(id, { x: Math.round(origin.x + dx), y: Math.round(origin.y + dy) });
    }
    this.ctx.doc.updateMany(patches);
  }

  onPointerUp(): void {
    const g = this.gesture;
    if (g?.kind === "move" && !g.started && g.toggleOnClick) {
      const next = new Set(this.ctx.getSelection());
      next.delete(g.toggleOnClick);
      this.ctx.setSelection(next);
    }
    this.onCancel();
  }

  onHover(p: CanvasPointer): void {
    const hit = this.ctx.shapeAt(p.world);
    this.ctx.setHover(hit && !this.ctx.getSelection().has(hit.id) ? hit.id : null);
  }

  onCancel(): void {
    this.gesture = null;
    this.ctx.setMarquee(null);
    this.ctx.setCursor(this.cursor);
  }
}
