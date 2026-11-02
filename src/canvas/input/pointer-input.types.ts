import type { Camera } from "../camera";
import type { CanvasPointer, Tool } from "../tools";

/** The pointer driving the current gesture and the tool it was routed to. */
export interface ActivePointer {
  pointerId: number;
  tool: Tool;
  /** A finger: a second one ends the gesture, while a pen or a mouse ignores fingers. */
  touch: boolean;
  /** Its latest event. */
  last: PointerEvent;
}

/** A first finger not yet given to the tool, in case a second one follows (see `PointerInput`). */
export interface HeldFinger {
  event: PointerEvent;
  /** Where it went down. */
  down: CanvasPointer;
  /** Where it went since. */
  moves: CanvasPointer[];
  timer: ReturnType<typeof setTimeout>;
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
  /** Fingers moved the camera. */
  onCameraChange(): void;
}
