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
