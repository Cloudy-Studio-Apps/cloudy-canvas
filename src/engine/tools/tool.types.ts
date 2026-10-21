import type { Camera } from "../camera";
import type { BoardDocument } from "../document";
import type { AnyElement, GeoVariantId } from "../elements";
import type { Interaction } from "../handles";
import type { Point, Rect } from "../geometry.types";
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
  shapeKind: GeoVariantId;
  shapeFill: string;
  shapeStroke: string;
}

/** What tools can do to the engine. */
export interface ToolContext {
  readonly doc: BoardDocument;
  readonly camera: Camera;
  getOptions(): ToolOptions;
  getSelection(): ReadonlySet<string>;
  setSelection(ids: Iterable<string>): void;
  setTool(tool: ToolId): void;
  elementAt(world: Point): AnyElement | undefined;
  /** An element as the scene sees it. */
  getElement(id: string): AnyElement | undefined;
  elementsInRect(rect: Rect): AnyElement[];
  editText(id: string): void;
  setCursor(cursor: string): void;
  setHover(id: string | null): void;
  getHover(): string | null;
  setMarquee(rect: Rect | null): void;
  drawDraftStroke(points: number[] | null): void;
  /** Handle under the point (e.g. a resize handle), if any. */
  interactionAt(world: Point): Interaction | null;
  /** Pans while `screen` is near the viewport edge; `null` stops. `onPan` runs after each step. */
  autoPan(screen: Point | null, onPan?: () => void): void;
  panBy(dx: number, dy: number): void;
  requestRender(): void;
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
