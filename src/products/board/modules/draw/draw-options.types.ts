import type { StrokePen } from "./stroke.types";

/** The marker's options. Each pen keeps its own color and thickness. */
export interface DrawToolOptions {
  /** What the marker tool draws with. */
  drawPen: StrokePen;
  /** Whether new strokes are smoothed when they're finished. */
  drawSmooth: boolean;
  markerColor: string;
  markerSize: number;
  highlighterColor: string;
  highlighterSize: number;
}
