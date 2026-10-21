import { moveShapePatch, type Shape, type ShapePatch } from "../document";
import { rectFromPoints, rectContainsPoint } from "../geometry";
import { canQuickConnect, resizeCursor, type Interaction } from "../handles";
import { ConnectGesture } from "./connect-gesture";
import { ConnectorDrag } from "./connector-drag";
import { ResizeGesture } from "./resize-gesture";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";
import type { Gesture } from "./select-tool.types";

const DRAG_THRESHOLD = 3; // screen px
/** The hovered shape stays hovered this far outside it (screen px) so its quick-connect dots can be reached. */
const HOVER_KEEP_PX = 28;

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

    // Sections carry along everything inside them.
    const origins = new Map<string, Shape>();
    for (const id of this.ctx.withSectionMembers(this.ctx.getSelection())) {
      const shape = this.ctx.doc.get(id);
      if (shape) origins.set(id, shape);
    }
    this.gesture = { kind: "move", start: p, origins, started: false, toggleOnClick };
  }

  onPointerMove(p: CanvasPointer): void {
    const g = this.gesture;
    if (!g) return;

    if (g.kind === "connect") return g.connect.move(p);
    if (g.kind === "resize") return g.resize.move(p);
    if (g.kind === "connector") return g.drag.move(p);

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
    for (const [id, origin] of g.origins) patches.set(id, moveShapePatch(origin, dx, dy));
    this.ctx.doc.updateMany(patches);
  }

  onPointerUp(): void {
    const g = this.gesture;
    if (g?.kind === "move" && !g.started && g.toggleOnClick) {
      const next = new Set(this.ctx.getSelection());
      next.delete(g.toggleOnClick);
      this.ctx.setSelection(next);
    }
    if (g?.kind === "connect") g.connect.finish();
    if (g?.kind === "connector") g.drag.finish();
    this.gesture = null;
    this.onCancel();
  }

  onHover(p: CanvasPointer): void {
    const interaction = this.ctx.interactionAt(p.world);
    this.ctx.setCursor(interaction ? interactionCursor(interaction) : this.cursor);
    if (interaction?.kind === "quick-connect" || this.keepsHover(p)) return;
    const hit = this.ctx.shapeAt(p.world);
    this.ctx.setHover(hit && !this.ctx.getSelection().has(hit.id) ? hit.id : null);
  }

  onCameraChange(): void {
    if (this.gesture?.kind === "connect") this.gesture.connect.update();
    if (this.gesture?.kind === "connector") this.gesture.drag.update();
  }

  onCancel(): void {
    if (this.gesture?.kind === "connect") this.gesture.connect.cancel();
    if (this.gesture?.kind === "connector") this.gesture.drag.cancel();
    this.gesture = null;
    this.ctx.setMarquee(null);
    this.ctx.setCursor(this.cursor);
  }

  private startInteraction(interaction: Interaction, p: CanvasPointer): Gesture {
    switch (interaction.kind) {
      case "column":
        this.ctx.setCursor("crosshair");
        return { kind: "connect", connect: new ConnectGesture(this.ctx, interaction.handle, p) };
      case "resize":
        return {
          kind: "resize",
          resize: new ResizeGesture(this.ctx, interaction.shape, interaction.handle, p),
        };
      case "endpoint":
        return {
          kind: "connector",
          drag: new ConnectorDrag(
            this.ctx,
            { kind: "existing", id: interaction.connector.id, which: interaction.which },
            p,
          ),
        };
      case "quick-connect": {
        const { shape, side } = interaction;
        const start = {
          shapeId: shape.id,
          side,
          x: Math.round(p.world.x),
          y: Math.round(p.world.y),
        };
        return { kind: "connector", drag: new ConnectorDrag(this.ctx, { kind: "new", start }, p) };
      }
    }
  }

  /** Whether the pointer is still close enough to the hovered shape to reach its quick-connect dots. */
  private keepsHover(p: CanvasPointer): boolean {
    const id = this.ctx.getHover();
    const shape = id ? this.ctx.getShape(id) : undefined;
    if (!canQuickConnect(shape)) return false;
    return rectContainsPoint(shape, p.world, HOVER_KEEP_PX / this.ctx.camera.zoom);
  }
}

function interactionCursor(interaction: Interaction): string {
  if (interaction.kind === "resize") return resizeCursor(interaction.handle);
  if (interaction.kind === "endpoint") return "move";
  return "crosshair";
}
