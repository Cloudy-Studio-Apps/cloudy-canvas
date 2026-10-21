import type { CanvasElement, ElementPatch } from "../elements";
import { rectFromPoints } from "../geometry";
import { resizeCursor, type Interaction } from "../handles";
import { ResizeGesture } from "./resize-gesture";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";
import type { Gesture } from "./select-tool.types";

const DRAG_THRESHOLD = 3; // screen px

export class SelectTool implements Tool {
  readonly id = "select" as const;
  readonly cursor = "default";
  private gesture: Gesture | null = null;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    const interaction = this.ctx.interactionAt(p.world);
    if (interaction) {
      this.gesture = this.startInteraction(interaction, p);
      this.ctx.setHover(null);
      return;
    }

    const hit = this.ctx.elementAt(p.world);
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

    const origins = new Map<string, CanvasElement>();
    for (const id of this.ctx.getSelection()) {
      const el = this.ctx.doc.get(id);
      if (el) origins.set(id, el);
    }
    this.gesture = { kind: "move", start: p, origins, started: false, toggleOnClick };
  }

  onPointerMove(p: CanvasPointer): void {
    const g = this.gesture;
    if (!g) return;

    if (g.kind === "resize") return g.resize.move(p);
    if (g.kind === "element") return g.gesture.move(p);

    if (g.kind === "marquee") {
      const rect = rectFromPoints(g.start.world, p.world);
      this.ctx.setMarquee(rect);
      const hits = this.ctx.elementsInRect(rect).map((el) => el.id);
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
    const patches = new Map<string, ElementPatch>();
    for (const [id, origin] of g.origins)
      patches.set(id, this.ctx.kinds.kindOf(origin).move(origin, dx, dy));
    this.ctx.doc.updateMany(patches);
  }

  onPointerUp(p: CanvasPointer): void {
    const g = this.gesture;
    if (g?.kind === "move" && !g.started && g.toggleOnClick) {
      const next = new Set(this.ctx.getSelection());
      next.delete(g.toggleOnClick);
      this.ctx.setSelection(next);
    }
    if (g?.kind === "element") {
      // Finished gestures don't get cancelled too.
      this.gesture = null;
      g.gesture.finish(p);
    }
    this.onCancel();
  }

  onHover(p: CanvasPointer): void {
    const interaction = this.ctx.interactionAt(p.world);
    this.ctx.setCursor(interaction ? interactionCursor(interaction) : this.cursor);
    const hit = this.ctx.elementAt(p.world);
    this.ctx.setHover(hit && !this.ctx.getSelection().has(hit.id) ? hit.id : null);
  }

  onCameraChange(): void {
    if (this.gesture?.kind === "element") this.gesture.gesture.onCameraChange?.();
  }

  onCancel(): void {
    if (this.gesture?.kind === "element") this.gesture.gesture.cancel();
    this.gesture = null;
    this.ctx.setMarquee(null);
    this.ctx.setCursor(this.cursor);
  }

  /** A gesture for the grabbed handle, or `null` when the press was a one-shot action. */
  private startInteraction(interaction: Interaction, p: CanvasPointer): Gesture | null {
    if (interaction.kind === "resize") {
      return {
        kind: "resize",
        resize: new ResizeGesture(this.ctx, interaction.element, interaction.handle, p),
      };
    }
    this.ctx.setCursor(interaction.interaction.cursor);
    const gesture = interaction.interaction.press(this.ctx, p);
    return gesture && { kind: "element", gesture };
  }
}

function interactionCursor(interaction: Interaction): string {
  return interaction.kind === "resize"
    ? resizeCursor(interaction.handle)
    : interaction.interaction.cursor;
}
