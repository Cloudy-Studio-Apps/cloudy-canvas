import { pastThreshold, type CanvasPointer, type Point, type ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { DESIGN_PROTOTYPE, editInteraction, newInteraction, screenOf } from "../model";
import { CONNECT_DRAG, type ConnectDrag } from "./connect-drag";
import type { ConnectDrop } from "./connect-drag.types";
import { rightMiddle } from "./right-middle";

/** A drop on empty canvas at least this far from the press (screen px) adds a Back. */
const BACK_THRESHOLD_PX = 24;

/**
 * Dragging a link out of a layer (or a screen): dropped on another screen it adds a click that
 * navigates there, on empty canvas (past `BACK_THRESHOLD_PX`) a click that goes back, anywhere
 * else nothing. One undo step (`DESIGN_PROTOTYPE.addInteraction`), then the source is selected.
 * The line on screen is `CONNECT_DRAG`'s.
 */
export class ConnectGesture {
  private from: string | null = null;
  /** The screen `from` is on: dropping there adds nothing. */
  private own: string | null = null;
  private press: CanvasPointer | null = null;
  private last: CanvasPointer | null = null;

  constructor(private readonly ctx: ToolContext<DesignToolOptions>) {}

  /** Whether a link is being dragged. */
  get active(): boolean {
    return this.from !== null;
  }

  begin(from: string, p: CanvasPointer): void {
    const el = this.ctx.getElement(from);
    this.from = from;
    this.own = screenOf(this.ctx.doc, from)?.id ?? null;
    this.press = p;
    this.last = p;
    this.ctx.setHover(null);
    this.ctx.setCursor("crosshair");
    this.drag.start(from, el ? rightMiddle(el) : p.world);
    this.drag.move(p.world, this.targetAt(p.world));
  }

  move(p: CanvasPointer): void {
    if (!this.from) return;
    this.last = p;
    this.drag.move(p.world, this.targetAt(p.world));
  }

  /** The camera moved mid-drag: the pointer stays put on screen, so it's elsewhere in the world. */
  onCameraChange(): void {
    if (this.last)
      this.move({ ...this.last, world: this.ctx.camera.screenToWorld(this.last.screen) });
  }

  finish(p: CanvasPointer): void {
    const { from, press } = this;
    if (!from || !press) return this.cancel();
    let drop: ConnectDrop | null = null;
    try {
      if (this.ctx.getElement(from)) {
        const prototype = this.ctx.service(DESIGN_PROTOTYPE);
        const target = this.targetAt(p.world);
        if (target) {
          prototype.addInteraction(from, newInteraction(target));
          drop = { from, to: target };
        } else if (!this.ctx.elementAt(p.world) && pastThreshold(press, p, BACK_THRESHOLD_PX)) {
          prototype.addInteraction(from, editInteraction(newInteraction(), { action: "back" }));
          drop = { from, to: null };
        }
        this.ctx.setSelection([from]);
      }
    } finally {
      this.reset(drop);
    }
  }

  /** Drops the drag without adding anything (Esc, a tool switch). */
  cancel(): void {
    if (this.active) this.reset(null);
  }

  private reset(drop: ConnectDrop | null): void {
    this.from = null;
    this.own = null;
    this.press = null;
    this.last = null;
    this.drag.end(drop);
  }

  /** The screen under `world` a drop would link to: any but the source's own. */
  private targetAt(world: Point): string | null {
    const hit = this.ctx.elementAt(world);
    const screen = hit ? screenOf(this.ctx.doc, hit.id) : null;
    return screen && screen.id !== this.own ? screen.id : null;
  }

  private get drag(): ConnectDrag {
    return this.ctx.service(CONNECT_DRAG);
  }
}
