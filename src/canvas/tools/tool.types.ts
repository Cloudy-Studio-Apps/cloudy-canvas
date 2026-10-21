import type { Camera } from "../camera";
import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds } from "../elements";
import type { Interaction } from "../handles";
import type { Guide } from "../links";
import type { Point, Rect } from "../geometry.types";

export interface CanvasPointer {
  screen: Point;
  world: Point;
  shiftKey: boolean;
  /** Ctrl on Windows/Linux, Cmd on macOS. */
  modKey: boolean;
  altKey: boolean;
}

/** What tools can do to the engine. `O` is the product's tool options. */
export interface ToolContext<O extends object = object> {
  readonly doc: CanvasDocument;
  readonly camera: Camera;
  readonly kinds: ElementKinds<O>;
  getOptions(): O;
  getSelection(): ReadonlySet<string>;
  setSelection(ids: Iterable<string>): void;
  setTool(tool: string): void;
  elementAt(world: Point): CanvasElement | undefined;
  /** An element as the scene sees it. */
  getElement(id: string): CanvasElement | undefined;
  elementsInRect(rect: Rect): CanvasElement[];
  /** The ids plus what moves with them (e.g. an entity's attributes). */
  withMembers(ids: Iterable<string>): Set<string>;
  editText(id: string): void;
  setCursor(cursor: string): void;
  setHover(id: string | null): void;
  getHover(): string | null;
  setMarquee(rect: Rect | null): void;
  /**
   * Shows an element that isn't in the document yet (e.g. the stroke being drawn), drawn by its
   * kind like any other element. `null` clears it.
   */
  setDraft(el: CanvasElement | null): void;
  /** Shows gesture feedback above the elements (e.g. a line being dragged); `null` clears it. */
  setGuide(guide: Guide | null): void;
  /** Handle under the point (e.g. a resize handle), if any. */
  interactionAt(world: Point): Interaction | null;
  /** Pans while `screen` is near the viewport edge; `null` stops. `onPan` runs after each step. */
  autoPan(screen: Point | null, onPan?: () => void): void;
  panBy(dx: number, dy: number): void;
  requestRender(): void;
}

/** A tool. Products add theirs next to the built-in select and hand tools. */
export interface Tool {
  /** Unique per product; its keymap command is `tool.<id>`. */
  readonly id: string;
  readonly cursor: string;
  onPointerDown(p: CanvasPointer): void;
  onPointerMove?(p: CanvasPointer): void;
  onPointerUp?(p: CanvasPointer): void;
  /** Pointer moved without a button pressed. */
  onHover?(p: CanvasPointer): void;
  /** The camera moved (wheel, zoom controls, auto-pan) — e.g. mid-gesture. */
  onCameraChange?(): void;
  /** Tool switched away or the gesture was cancelled. */
  onCancel?(): void;
}
