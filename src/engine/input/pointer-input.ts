import type { Camera } from "../camera";
import type { CanvasPointer, Tool } from "../tools";
import type { Disposables } from "../utils";
import { toCanvasPointer } from "./canvas-pointer";

export interface PointerInputHost {
  readonly canvas: HTMLCanvasElement;
  readonly camera: Camera;
  activeTool(): Tool;
  /** Tool used for temporary panning (middle button or held Space). */
  panTool(): Tool;
  setCursor(cursor: string): void;
  setHover(id: string | null): void;
  /** A press is about to start a gesture (e.g. commit text editing first). */
  onGestureStart(): void;
  onDoubleClick(pointer: CanvasPointer): void;
}

/** Routes pointer events to the active tool, with Space / middle-button panning from any tool. */
export class PointerInput {
  private spaceHeld = false;
  private active: { pointerId: number; tool: Tool } | null = null;

  constructor(private readonly host: PointerInputHost) {}

  bind(disposables: Disposables): void {
    const { canvas } = this.host;
    disposables.listen(canvas, "pointerdown", this.handleDown);
    disposables.listen(canvas, "pointermove", this.handleMove);
    disposables.listen(canvas, "pointerup", this.handleUp);
    disposables.listen(canvas, "pointercancel", this.handleCancel);
    disposables.listen(canvas, "pointerleave", () => this.host.setHover(null));
    disposables.listen(canvas, "dblclick", (event) => this.host.onDoubleClick(this.pointer(event)));
    disposables.listen(canvas, "contextmenu", (event) => event.preventDefault());
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
    if (this.active) return;
    const isPan = event.button === 1 || (event.button === 0 && this.spaceHeld);
    if (event.button !== 0 && !isPan) return;
    event.preventDefault();
    this.host.onGestureStart();

    const tool = isPan ? this.host.panTool() : this.host.activeTool();
    this.active = { pointerId: event.pointerId, tool };
    this.host.canvas.setPointerCapture(event.pointerId);
    tool.onPointerDown(this.pointer(event));
  };

  private handleMove = (event: PointerEvent) => {
    if (this.active?.pointerId === event.pointerId) {
      this.active.tool.onPointerMove?.(this.pointer(event));
    } else if (!this.active && !this.spaceHeld) {
      this.host.activeTool().onHover?.(this.pointer(event));
    }
  };

  private handleUp = (event: PointerEvent) => {
    if (this.active?.pointerId !== event.pointerId) return;
    const { tool } = this.active;
    this.active = null;
    tool.onPointerUp?.(this.pointer(event));
    this.host.setCursor(this.spaceHeld ? "grab" : this.host.activeTool().cursor);
  };

  private handleCancel = (event: PointerEvent) => {
    if (this.active?.pointerId !== event.pointerId) return;
    this.active.tool.onCancel?.();
    this.active = null;
    this.host.setCursor(this.host.activeTool().cursor);
  };
}
