import type { CanvasPointer, ToolContext } from "../tools/tool.types";

/** What the select tool tells a kind when asking whether a press would grab part of an element. */
export interface InteractionQuery {
  /** Grab radius in world units (a few screen px at the current zoom). */
  reach: number;
  zoom: number;
  selected: boolean;
  hovered: boolean;
}

/**
 * Part of an element that a press grabs before the element itself is selected: a handle to drag,
 * a button to click. Kinds return these from `interactionAt`.
 */
export interface ElementInteraction<O extends object = object> {
  /** Cursor while the pointer is over it. */
  cursor: string;
  /** Runs on press. Returns the gesture that follows the drag, or `null` for a one-shot action. */
  press(ctx: ToolContext<O>, p: CanvasPointer): ElementGesture | null;
}

/** A drag started by an `ElementInteraction`. */
export interface ElementGesture {
  move(p: CanvasPointer): void;
  finish(p: CanvasPointer): void;
  /** The tool was switched or the gesture cancelled. */
  cancel(): void;
  /** The camera moved mid-drag (wheel, auto-pan). */
  onCameraChange?(): void;
}
