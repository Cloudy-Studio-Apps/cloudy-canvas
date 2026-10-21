import type { Camera } from "../camera";
import type { CanvasPointer, Tool } from "../tools";

/** The pointer driving the current gesture and the tool it was routed to. */
export interface ActivePointer {
  pointerId: number;
  tool: Tool;
}

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
  /** A right-click (the browser's own menu is suppressed). */
  onContextMenu(pointer: CanvasPointer): void;
}
