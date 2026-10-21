import type { Camera } from "../camera";
import type { DbSchema, HandleHit } from "../db";
import type { BoardDocument, DbTableShape, Shape, TextShape } from "../document";
import type { Point, Rect } from "../geometry.types";
import type { DropTarget } from "../render";
import type { DraftRelation } from "../scene.types";
import type { TOOL_IDS } from "./tool-ids";

export type ToolId = (typeof TOOL_IDS)[number];

export interface CanvasPointer {
  screen: Point;
  world: Point;
  shiftKey: boolean;
  /** Ctrl on Windows/Linux, Cmd on macOS. */
  modKey: boolean;
  altKey: boolean;
}

export interface ToolOptions {
  markerColor: string;
  markerSize: number;
  stickyColor: string;
}

/** What tools can do to the engine. */
export interface ToolContext {
  readonly doc: BoardDocument;
  readonly db: DbSchema;
  readonly camera: Camera;
  getOptions(): ToolOptions;
  getSelection(): ReadonlySet<string>;
  setSelection(ids: Iterable<string>): void;
  setTool(tool: ToolId): void;
  shapeAt(world: Point): Shape | undefined;
  shapesInRect(rect: Rect): Shape[];
  editText(id: string): void;
  /** Opens the editor for a new, not-yet-added text shape. */
  editNewText(shape: TextShape): void;
  setCursor(cursor: string): void;
  setHover(id: string | null): void;
  setMarquee(rect: Rect | null): void;
  drawDraftStroke(points: number[] | null): void;
  /** Column handle of a hovered or selected database table under the point. */
  handleAt(world: Point): TableHandle | null;
  /** Shows (or clears) the relation being dragged and the row it would connect to. */
  setDraftRelation(draft: DraftRelation | null, target: DropTarget | null): void;
  /** Pans while `screen` is near the viewport edge; `null` stops. `onPan` runs after each step. */
  autoPan(screen: Point | null, onPan?: () => void): void;
  panBy(dx: number, dy: number): void;
  requestRender(): void;
}

export interface TableHandle extends HandleHit {
  table: DbTableShape;
}

export interface Tool {
  readonly id: ToolId;
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
