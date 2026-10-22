import { elementBounds, type CanvasElement, type ElementPatch } from "../elements";
import { rectContainsPoint, rectFromPoints, unionRects } from "../geometry";
import { measureGaps } from "../snapping";
import { cornerRotateCursor, resizeCursor, type Interaction, type ResizeMode } from "../handles";
import { ResizeGesture } from "./resize-gesture";
import { RotateGesture } from "./rotate-gesture";
import { MOVE_THRESHOLD_PX, pastThreshold } from "./drag-threshold";
import type { Rect } from "../geometry.types";
import type { CanvasPointer, Tool, ToolContext } from "./tool.types";
import type { Gesture } from "./select-tool.types";

/**
 * A hovered element with handles stays hovered this far outside it (screen px), so handles drawn
 * just outside it (e.g. quick-connect dots) can be reached.
 */
const HOVER_KEEP_PX = 28;

export class SelectTool implements Tool {
  readonly id: string = "select";
  readonly cursor: string = "default";
  /** What dragging a resize handle does (the Scale tool scales instead). */
  readonly resizeMode: ResizeMode = "resize";
  private gesture: Gesture | null = null;
  /** Whether Alt + hover distances are on screen. */
  private measuring = false;

  constructor(private readonly ctx: ToolContext) {}

  onPointerDown(p: CanvasPointer): void {
    this.measure(undefined);
    const interaction = this.ctx.interactionAt(p.world);
    if (interaction) {
      this.gesture = this.startInteraction(interaction, p);
      this.ctx.setHover(null);
      return;
    }

    // A press anywhere but an element's handles drops the selected part (e.g. a table row); a
    // click on the same element may pick a new one, or extend it with Shift or Ctrl/Cmd.
    const partBefore = this.ctx.getPart();
    this.ctx.setPart(null);
    const hit = this.ctx.targetAt(p.world, p.modKey);
    this.ctx.setHover(null);

    if (!hit) {
      const base = p.shiftKey ? new Set(this.ctx.getSelection()) : new Set<string>();
      if (!p.shiftKey) this.ctx.setSelection([]);
      this.gesture = { kind: "marquee", start: p, base };
      return;
    }

    let toggleOnClick: string | null = null;
    const onlySelected = this.ctx.getSelection().size === 1 && this.ctx.getSelection().has(hit.id);
    // Shift-clicking the selected element extends its part when one is selected; otherwise Shift
    // adds or removes elements as usual.
    const extendsPart = (p.shiftKey || p.modKey) && partBefore !== null;
    const partOnClick = onlySelected && (extendsPart || !p.shiftKey) ? hit.id : null;
    if (p.shiftKey && !(onlySelected && extendsPart)) {
      if (this.ctx.getSelection().has(hit.id)) toggleOnClick = hit.id;
      else this.ctx.setSelection([...this.ctx.getSelection(), hit.id]);
    } else if (!this.ctx.getSelection().has(hit.id)) {
      this.ctx.setSelection([hit.id]);
    }

    const origins = new Map<string, CanvasElement>();
    for (const id of this.ctx.withMembers(this.ctx.getSelection())) {
      const el = this.ctx.doc.get(id);
      // Locked elements stay put, even when selected with ones that move.
      if (el && !el.locked) origins.set(id, el);
    }
    this.gesture = {
      kind: "move",
      start: p,
      origins,
      started: false,
      box: null,
      snapper: null,
      toggleOnClick,
      partOnClick,
      partBefore,
    };
  }

  onPointerMove(p: CanvasPointer): void {
    const g = this.gesture;
    if (!g) return;

    if (g.kind === "resize") return g.resize.move(p);
    if (g.kind === "rotate") return g.rotate.move(p);
    if (g.kind === "element") return g.gesture.move(p);

    if (g.kind === "marquee") {
      const rect = rectFromPoints(g.start.world, p.world);
      this.ctx.setMarquee(rect);
      const hits = this.ctx.elementsInRect(rect).map((el) => this.ctx.targetOf(el.id));
      this.ctx.setSelection(new Set([...g.base, ...hits]));
      return;
    }

    if (!g.started) {
      if (!pastThreshold(g.start, p, MOVE_THRESHOLD_PX)) return;
      g.started = true;
      this.ctx.setCursor("move");
      this.ctx.doc.checkpoint();
      // Alt-drag leaves the originals in place and drags out a copy.
      if (p.altKey) this.dragCopies(g);
      g.box = this.boxOf(g.origins.values());
      g.snapper = this.ctx.createSnapper(g.origins.keys());
    }

    let dx = p.world.x - g.start.world.x;
    let dy = p.world.y - g.start.world.y;
    if (g.box && g.snapper) {
      const snap = g.snapper.move({ ...g.box, x: g.box.x + dx, y: g.box.y + dy }, p);
      dx += snap.x;
      dy += snap.y;
    }
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
    if (g?.kind === "move" && !g.started && g.partOnClick) {
      const el = this.ctx.getElement(g.partOnClick);
      const click = { current: g.partBefore, shiftKey: p.shiftKey, modKey: p.modKey };
      if (el) this.ctx.setPart(this.ctx.kinds.kindOf(el).partAt(el, p.world, click));
    }
    if (g?.kind === "move" && g.started) this.ctx.moved(g.origins.keys());
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
    const hit = this.ctx.targetAt(p.world, p.modKey);
    this.measure(p.altKey ? hit : undefined);
    if (!hit && (interaction || this.keepsHover(p))) return;
    this.ctx.setHover(hit && !this.ctx.getSelection().has(hit.id) ? hit.id : null);
  }

  onCameraChange(): void {
    if (this.gesture?.kind === "element") this.gesture.gesture.onCameraChange?.();
  }

  onCancel(): void {
    if (this.gesture?.kind === "element") this.gesture.gesture.cancel();
    if (this.gesture?.kind === "move") this.gesture.snapper?.clear();
    if (this.gesture?.kind === "resize") this.gesture.resize.end();
    if (this.gesture?.kind === "rotate") this.gesture.rotate.end();
    this.measure(undefined);
    this.gesture = null;
    this.ctx.setMarquee(null);
    this.ctx.setCursor(this.cursor);
  }

  /** Turns a move into dragging copies of the moved elements, which become the selection. */
  private dragCopies(g: Extract<Gesture, { kind: "move" }>): void {
    const ids = this.ctx.duplicate(g.origins.keys());
    const origins = new Map<string, CanvasElement>();
    for (const id of ids.values()) {
      const el = this.ctx.doc.get(id);
      if (el) origins.set(id, el);
    }
    g.origins = origins;
    g.toggleOnClick = null;
    g.partOnClick = null;
    const selected = [...this.ctx.getSelection()].map((id) => ids.get(id));
    this.ctx.setSelection(selected.filter((id) => id !== undefined));
  }

  /** The box round these elements' outlines, or `null` when none is outlined. */
  private boxOf(elements: Iterable<CanvasElement>): Rect | null {
    const rects: Rect[] = [];
    for (const el of elements) {
      const kind = this.ctx.kinds.kindOf(el);
      if (kind.boxed) rects.push(elementBounds(kind, el));
    }
    return unionRects(rects);
  }

  /**
   * Shows the distances between the selection and the element under the pointer (Alt + hover),
   * or hides them (`undefined`).
   */
  private measure(other: CanvasElement | undefined): void {
    if (!other && !this.measuring) return;
    const selected = [...this.ctx.getSelection()].map((id) => this.ctx.getElement(id));
    const box = this.boxOf(selected.filter((el) => el !== undefined));
    const otherKind = other && this.ctx.kinds.kindOf(other);
    if (box && other && otherKind?.boxed && !this.ctx.getSelection().has(other.id)) {
      this.measuring = true;
      this.ctx.setSnapFeedback({
        lines: [],
        gaps: measureGaps(box, elementBounds(otherKind, other)),
      });
    } else if (this.measuring) {
      this.measuring = false;
      this.ctx.setSnapFeedback(null);
    }
  }

  /** Whether the pointer is still close enough to the hovered element to reach its handles. */
  private keepsHover(p: CanvasPointer): boolean {
    const id = this.ctx.getHover();
    const el = id ? this.ctx.getElement(id) : undefined;
    if (!el) return false;
    const kind = this.ctx.kinds.kindOf(el);
    const { zoom } = this.ctx.camera;
    if (kind.handles(el, zoom).length === 0) return false;
    return rectContainsPoint(elementBounds(kind, el), p.world, HOVER_KEEP_PX / zoom);
  }

  /** A gesture for the grabbed handle, or `null` when the press was a one-shot action. */
  private startInteraction(interaction: Interaction, p: CanvasPointer): Gesture | null {
    if (interaction.kind === "rotate") {
      const { target, corner } = interaction;
      return { kind: "rotate", rotate: new RotateGesture(this.ctx, target, corner, p) };
    }
    if (interaction.kind === "resize") {
      return {
        kind: "resize",
        resize: new ResizeGesture(
          this.ctx,
          interaction.target,
          interaction.handle,
          p,
          this.resizeMode,
        ),
      };
    }
    this.ctx.setCursor(interaction.interaction.cursor);
    const gesture = interaction.interaction.press(this.ctx, p);
    return gesture && { kind: "element", gesture };
  }
}

function interactionCursor(interaction: Interaction): string {
  switch (interaction.kind) {
    case "resize":
      return resizeCursor(interaction.handle, interaction.target.rotation);
    case "rotate":
      return cornerRotateCursor(interaction.corner, interaction.target.rotation);
    case "element":
      return interaction.interaction.cursor;
  }
}
