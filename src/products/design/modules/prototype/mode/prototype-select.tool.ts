import { SelectTool, type CanvasPointer, type ResizeMode, type ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { DESIGN_PROTOTYPE, screenOf } from "../model";
import { PROTOTYPE_TOOLS } from "../prototype.constants";
import { ConnectGesture } from "./connect-gesture";
import { rightMiddle } from "./right-middle";

/** How close to the connect handle (screen px from its center) a press grabs it. */
const HANDLE_HIT_PX = 8;

/**
 * The Prototype mode's tool: selects the layer under the pointer (deep, even inside groups),
 * never moving or resizing it. A press on the connect handle (the square on the right middle of
 * the single selected layer or screen) drags a link out of it instead (`ConnectGesture`). Delete
 * clears the selection's interactions; layers are never deleted here.
 */
export class PrototypeSelectTool extends SelectTool {
  override readonly id = PROTOTYPE_TOOLS.select;
  override readonly resizeMode: ResizeMode = "none";
  override readonly movesSelection = false;
  override readonly editsOnDoubleClick = false;
  private readonly connect: ConnectGesture;

  constructor(private readonly context: ToolContext<DesignToolOptions>) {
    super({ ...context, targetAt: (world) => context.targetAt(world, true) });
    this.connect = new ConnectGesture(context);
  }

  override onPointerDown(p: CanvasPointer): void {
    const from = this.handleAt(p);
    if (from) this.connect.begin(from, p);
    else super.onPointerDown(p);
  }

  override onPointerMove(p: CanvasPointer): void {
    if (this.connect.active) this.connect.move(p);
    else super.onPointerMove(p);
  }

  override onPointerUp(p: CanvasPointer): void {
    if (!this.connect.active) return super.onPointerUp(p);
    this.connect.finish(p);
    this.context.setCursor(this.cursor);
  }

  override onHover(p: CanvasPointer): void {
    super.onHover(p);
    if (this.handleAt(p)) this.context.setCursor("crosshair");
  }

  override onCameraChange(): void {
    if (this.connect.active) this.connect.onCameraChange();
    else super.onCameraChange();
  }

  override onCancel(): void {
    this.connect.cancel();
    super.onCancel();
  }

  onCommand(command: string): boolean {
    if (command === "cancel" && this.connect.active) {
      // Esc mid-drag drops the link, nothing else.
      this.connect.cancel();
      this.context.setCursor(this.cursor);
      return true;
    }
    if (command !== "deleteSelection") return false;
    this.context.service(DESIGN_PROTOTYPE).removeInteractions(this.context.getSelection());
    return true;
  }

  /** The single selected node whose connect handle is under the pointer, else `null`. */
  private handleAt(p: CanvasPointer): string | null {
    const selection = this.context.getSelection();
    if (selection.size !== 1) return null;
    const [id] = selection;
    const el = id === undefined ? undefined : this.context.getElement(id);
    if (!el || !screenOf(this.context.doc, el.id)) return null;
    const handle = this.context.camera.worldToScreen(rightMiddle(el));
    const near = Math.hypot(handle.x - p.screen.x, handle.y - p.screen.y) <= HANDLE_HIT_PX;
    return near ? el.id : null;
  }
}
