import type { Camera } from "../camera";
import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds } from "../elements";
import type { Interaction, ResizeMode } from "../handles";
import type { Guide } from "../links";
import type { Point, Rect } from "../geometry.types";
import type { RulerGuide } from "../ruler-guides";
import type { ServiceDef } from "../services";
import type { SnapAxis, SnapFeedback, Snapper } from "../snapping";

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
  /** A service of the engine (e.g. a board's ER diagrams), created on first use. */
  service<T>(def: ServiceDef<T>): T;
  getOptions(): O;
  getSelection(): ReadonlySet<string>;
  setSelection(ids: Iterable<string>): void;
  setTool(tool: string): void;
  /** The active tool's id. */
  getTool(): string;
  elementAt(world: Point): CanvasElement | undefined;
  /**
   * What a click at `world` selects (the product's `selectTarget`, e.g. the group around what's
   * hit); `deep` (Ctrl/Cmd) selects what's hit itself.
   */
  targetAt(world: Point, deep: boolean): CanvasElement | undefined;
  /** What selecting this element selects instead (e.g. its group), as `targetAt` does. */
  targetOf(id: string): string;
  /** An element as the scene sees it. */
  getElement(id: string): CanvasElement | undefined;
  elementsInRect(rect: Rect): CanvasElement[];
  /** The ids plus what moves with them (e.g. an entity's attributes). */
  withMembers(ids: Iterable<string>): Set<string>;
  /**
   * Tells the product elements were just dragged to a new place (`CanvasProduct.onMoved`, e.g.
   * dropped into a frame), in the current undo step.
   */
  moved(ids: Iterable<string>): void;
  /**
   * Adds copies of the elements (with what moves with them) in place, as a new undo step.
   * Returns original id → copy id.
   */
  duplicate(ids: Iterable<string>): Map<string, string>;
  /** Edits an element's text, or one text part of it (e.g. a table cell). */
  editText(id: string, part?: string): void;
  /** Types the text of a new element; it's added to the document (and selected) on commit. */
  editNewText(el: CanvasElement): void;
  /**
   * Selects a part of the single selected element (e.g. a table row), which the overlay outlines
   * and Delete removes; `null` clears it.
   */
  setPart(part: string | null): void;
  getPart(): string | null;
  setCursor(cursor: string): void;
  setHover(id: string | null): void;
  getHover(): string | null;
  setMarquee(rect: Rect | null): void;
  /**
   * Shows an element that isn't in the document yet (e.g. the stroke being drawn), drawn by its
   * kind like any other element. `null` clears it.
   */
  setDraft(el: CanvasElement | null): void;
  /** Dims elements, e.g. those a gesture will remove when it ends; `null` clears it. */
  setFaded(ids: Iterable<string> | null): void;
  /** The current mode's id (see `CanvasMode`; `DEFAULT_MODE.id` when none is on). */
  getMode(): string;
  /** Switches mode (e.g. double-clicking an ER shape enters the ER mode). */
  setMode(id: string): void;
  /** Shows gesture feedback above the elements (e.g. a line being dragged); `null` clears it. */
  setGuide(guide: Guide | null): void;
  /**
   * Snapping for one gesture: to the elements on screen but these ids (what's being moved, with
   * its members), following the user's snap settings. Clear it when the gesture ends.
   */
  createSnapper(exclude: Iterable<string>): Snapper;
  /** Shows smart guides or measurements (e.g. Alt + hover distances); `null` clears them. */
  setSnapFeedback(feedback: SnapFeedback | null): void;
  /** Plays a quick pop on elements just added to the document (e.g. a stamped sticker). */
  animateIn(ids: readonly string[]): void;
  /** The ruler guides of the scope on screen (see `CanvasGuides`); empty when there are none. */
  guides(): readonly RulerGuide[];
  /**
   * Replaces the scope's ruler guides, in the current undo step (`doc.checkpoint()` first for a new
   * one). Ignored when the product keeps none.
   */
  setGuides(guides: readonly RulerGuide[]): void;
  /** Shows the value of the guide at this index while it's dragged; `null` hides it. */
  setActiveGuide(index: number | null): void;
  /** Whether a screen point is over the shown ruler guides of `axis` come out of (see `overRuler`). */
  overRuler(axis: SnapAxis, screen: Point): boolean;
  /** Handle under the point (e.g. a resize handle), if any. */
  interactionAt(world: Point): Interaction | null;
  /** Pans while `screen` is near the viewport edge; `null` stops. `onPan` runs after each step. */
  autoPan(screen: Point | null, onPan?: () => void): void;
  panBy(dx: number, dy: number): void;
  /** Hands an element's action (e.g. "play") to the host, which decides what it does. */
  activate(elementId: string, action: string): void;
  requestRender(): void;
}

/** A tool. Products add theirs next to the built-in select and hand tools. */
export interface Tool {
  /** Unique per product; its keymap command is `tool.<id>`. */
  readonly id: string;
  readonly cursor: string;
  /**
   * What the selection's resize handles do while it's on (and whether a selection that only
   * scales gets them): the Scale tool's `scale`. Unset is `resize`.
   */
  readonly resizeMode?: ResizeMode;
  /** Double-click edits what it hits (enters groups, edits text) while it's on: the select tool. */
  readonly editsOnDoubleClick?: boolean;
  onPointerDown(p: CanvasPointer): void;
  onPointerMove?(p: CanvasPointer): void;
  onPointerUp?(p: CanvasPointer): void;
  /** Pointer moved without a button pressed. */
  onHover?(p: CanvasPointer): void;
  /** The camera moved (wheel, zoom controls, auto-pan) — e.g. mid-gesture. */
  onCameraChange?(): void;
  /** Tool switched away or the gesture was cancelled. */
  onCancel?(): void;
  /** The tool was just switched to (e.g. to show feedback that stays while it's on). */
  onActivate?(): void;
  /**
   * A command (`deleteSelection`, `cancel`, …) while the tool is on: returns `true` when the tool
   * handled it, so the engine's own handler doesn't run (e.g. an edit mode's Delete).
   */
  onCommand?(command: string): boolean;
}
