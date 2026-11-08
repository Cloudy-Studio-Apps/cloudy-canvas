import type { CanvasElement, CanvasPointer, Tool, ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { screenOf } from "../model";
import { PROTOTYPE_TOOLS } from "../prototype.constants";
import { ConnectGesture } from "./connect-gesture";

/**
 * The Prototype mode's Connect tool (L): a press on any layer of a screen, or on a screen's empty
 * area, drags a link out of it (`ConnectGesture`). It never selects by itself; the source is
 * selected once the link is dropped.
 */
export class ConnectTool implements Tool {
  readonly id = PROTOTYPE_TOOLS.connect;
  readonly cursor = "crosshair";
  private readonly gesture: ConnectGesture;

  constructor(private readonly ctx: ToolContext<DesignToolOptions>) {
    this.gesture = new ConnectGesture(ctx);
  }

  onPointerDown(p: CanvasPointer): void {
    const source = this.sourceAt(p);
    if (source) this.gesture.begin(source.id, p);
  }

  onPointerMove(p: CanvasPointer): void {
    this.gesture.move(p);
  }

  onPointerUp(p: CanvasPointer): void {
    if (this.gesture.active) this.gesture.finish(p);
  }

  onHover(p: CanvasPointer): void {
    this.ctx.setHover(this.sourceAt(p)?.id ?? null);
  }

  onCameraChange(): void {
    this.gesture.onCameraChange();
  }

  onCancel(): void {
    this.gesture.cancel();
    this.ctx.setHover(null);
    this.ctx.setCursor(this.cursor);
  }

  /** Esc mid-drag drops the link; otherwise it does what it always does. */
  onCommand(command: string): boolean {
    if (command !== "cancel" || !this.gesture.active) return false;
    this.gesture.cancel();
    return true;
  }

  /** What a press here links from: the layer under the pointer (deep), when it's on a screen. */
  private sourceAt(p: CanvasPointer): CanvasElement | undefined {
    const hit = this.ctx.targetAt(p.world, true);
    return hit && screenOf(this.ctx.doc, hit.id) ? hit : undefined;
  }
}
