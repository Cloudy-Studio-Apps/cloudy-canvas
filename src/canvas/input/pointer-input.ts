import type { CanvasPointer } from "../tools";
import type { Disposables } from "../utils";
import { toCanvasPointer } from "./canvas-pointer";
import type { ActivePointer, HeldFinger, PointerInputHost } from "./pointer-input.types";
import { TouchNavigation } from "./touch-navigation";

/**
 * How long a first finger waits for a second. Two fingers never land together, and without this
 * the first would deselect, or start a marquee or a stroke, on its way into every pinch.
 */
const SECOND_FINGER_WAIT_MS = 60;

/**
 * Routes pointer events to the active tool, with Space / middle-button panning from any tool, and
 * two fingers moving the camera (see `TouchNavigation`).
 */
export class PointerInput {
  private spaceHeld = false;
  private active: ActivePointer | null = null;
  private held: HeldFinger | null = null;
  private readonly touch: TouchNavigation;

  constructor(private readonly host: PointerInputHost) {
    this.touch = new TouchNavigation({
      canvas: host.canvas,
      camera: host.camera,
      onChange: () => host.onCameraChange(),
    });
  }

  bind(disposables: Disposables): void {
    const { canvas } = this.host;
    disposables.listen(canvas, "pointerdown", this.handleDown);
    disposables.listen(canvas, "pointermove", this.handleMove);
    disposables.listen(canvas, "pointerup", this.handleUp);
    disposables.listen(canvas, "pointercancel", this.handleCancel);
    disposables.listen(canvas, "pointerleave", () => this.host.setHover(null));
    disposables.listen(canvas, "dblclick", (event) => this.host.onDoubleClick(this.pointer(event)));
    disposables.listen(canvas, "contextmenu", (event) => {
      event.preventDefault();
      if (!this.active) this.host.onContextMenu(this.pointer(event));
    });
    disposables.add(() => this.dropHeld());
  }

  holdSpace(): void {
    if (this.spaceHeld || this.active) return;
    this.spaceHeld = true;
    this.host.setHover(null);
    this.host.setCursor("grab");
  }

  releaseSpace(): void {
    if (!this.spaceHeld) return;
    this.spaceHeld = false;
    if (!this.active) this.host.setCursor(this.host.activeTool().cursor);
  }

  private pointer(event: PointerEvent | MouseEvent): CanvasPointer {
    return toCanvasPointer(event, this.host.canvas, this.host.camera);
  }

  private handleDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      this.fingerDown(event);
      return;
    }
    if (this.active || this.touch.active) return;
    if (event.button !== 0 && !this.isPan(event)) return;
    event.preventDefault();
    // A finger still waiting is the hand resting on the screen.
    this.dropHeld();
    this.host.canvas.setPointerCapture(event.pointerId);
    this.begin(event, this.pointer(event));
  };

  private isPan(event: PointerEvent): boolean {
    return event.button === 1 || (event.button === 0 && this.spaceHeld);
  }

  private fingerDown(event: PointerEvent): void {
    event.preventDefault();
    // A pen or a mouse is drawing: this is the hand resting on the screen.
    if (this.active && !this.active.touch) return;

    const first = this.takeFirstFinger();
    if (first) {
      this.host.setHover(null);
      this.touch.add(first);
      this.touch.add(event);
    } else if (this.touch.active) {
      this.touch.add(event);
    } else {
      this.held = {
        event,
        down: this.pointer(event),
        moves: [],
        timer: setTimeout(this.releaseHeld, SECOND_FINGER_WAIT_MS),
      };
    }
  }

  /** Takes the finger on the canvas away from the tool, for the second one that just came down. */
  private takeFirstFinger(): PointerEvent | null {
    const held = this.dropHeld();
    if (held) return held.event;
    if (!this.active) return null;
    const { tool, last } = this.active;
    this.active = null;
    tool.onCancel?.();
    this.host.setCursor(this.host.activeTool().cursor);
    return last;
  }

  private dropHeld(): HeldFinger | null {
    const held = this.held;
    if (held) clearTimeout(held.timer);
    this.held = null;
    return held;
  }

  /** No second finger came: the tool gets this one, with where it went while it waited. */
  private releaseHeld = () => {
    const held = this.dropHeld();
    if (!held) return;
    this.begin(held.event, held.down);
    for (const point of held.moves) this.active?.tool.onPointerMove?.(point);
  };

  private begin(event: PointerEvent, pointer: CanvasPointer): void {
    this.host.onGestureStart();
    const tool = this.isPan(event) ? this.host.panTool() : this.host.activeTool();
    this.active = {
      pointerId: event.pointerId,
      tool,
      touch: event.pointerType === "touch",
      last: event,
    };
    tool.onPointerDown(pointer);
  }

  private handleMove = (event: PointerEvent) => {
    if (this.held?.event.pointerId === event.pointerId) {
      const passed = event.getCoalescedEvents?.();
      const points = passed?.length ? passed : [event];
      this.held.moves.push(...points.map((point) => this.pointer(point)));
    } else if (this.touch.has(event.pointerId)) {
      this.touch.move(event);
    } else if (this.active?.pointerId === event.pointerId) {
      this.active.last = event;
      const { tool } = this.active;
      // A fast hand outruns the screen: this one event can stand for several points.
      const passed = tool.tracesPointer ? event.getCoalescedEvents?.() : undefined;
      for (const point of passed?.length ? passed : [event]) {
        tool.onPointerMove?.(this.pointer(point));
      }
    } else if (!this.active && !this.spaceHeld && event.pointerType !== "touch") {
      this.host.activeTool().onHover?.(this.pointer(event));
    }
  };

  private handleUp = (event: PointerEvent) => {
    if (this.held?.event.pointerId === event.pointerId) this.releaseHeld();
    if (this.touch.has(event.pointerId)) {
      this.touch.remove(event.pointerId);
      return;
    }
    if (this.active?.pointerId !== event.pointerId) return;
    const { tool } = this.active;
    this.active = null;
    tool.onPointerUp?.(this.pointer(event));
    this.host.setCursor(this.spaceHeld ? "grab" : this.host.activeTool().cursor);
  };

  private handleCancel = (event: PointerEvent) => {
    if (this.held?.event.pointerId === event.pointerId) this.dropHeld();
    this.touch.remove(event.pointerId);
    if (this.active?.pointerId !== event.pointerId) return;
    this.active.tool.onCancel?.();
    this.active = null;
    this.host.setCursor(this.host.activeTool().cursor);
  };
}
