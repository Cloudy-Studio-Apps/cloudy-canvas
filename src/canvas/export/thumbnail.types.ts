import type { Rect } from "../geometry.types";
import type { ExportHost } from "./export.types";

export interface ThumbnailOptions {
  /** Size of the picture in pixels; the canvas is framed to this proportion. */
  width: number;
  height: number;
}

/** What `renderThumbnail` needs from the engine. */
export interface ThumbnailHost extends Pick<ExportHost, "elementsOf" | "bounds" | "background"> {
  /** Draws `rect` of the canvas as it's on screen, at `scale` pixels per world unit. */
  capture(rect: Rect, scale: number): HTMLCanvasElement;
}

/** A picture of an area as it shows on the canvas (`engine.captureArea`). */
export interface CaptureAreaOptions {
  /** Pixels per world unit. */
  scale: number;
  /** Draws dimmed elements (a mode's or a tool's) undimmed. */
  unfaded?: boolean;
  /** JPEG quality, 0–1 (default 0.85). */
  quality?: number;
}
